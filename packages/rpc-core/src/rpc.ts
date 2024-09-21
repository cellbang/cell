/* eslint-disable @typescript-eslint/no-explicit-any */

import { DisposableCollection, Disposable } from '@celljs/core/lib/common/utils/disposable';
import { Deferred } from '@celljs/core/lib/common/utils/promise-util';
import { CancellationToken, CancellationTokenSource } from '@celljs/core/lib/common/utils/cancellation';
import { CancelMessage, ConnectionClosedError, MessageConnection, MessageType, ObjectsTransferrer, OpenMessage,
    ProxyIdentifier, RPC, RPCMessage, ReadyMessage, ReplyErrMessage, ReplyMessage, RequestMessage, SerializedError } from './rpc-protocol';
import { RPCMultiplexer } from './rpc-multiplexer';

function isBoolean(value: any): value is boolean {
    return value === true || value === false;
}

function isCancellationToken(value: any): value is CancellationToken {
    const candidate = value as CancellationToken;
    return (
        candidate &&
        (candidate === CancellationToken.None ||
            candidate === CancellationToken.Cancelled ||
            (isBoolean(candidate.isCancellationRequested) && !!candidate.onCancellationRequested))
    );
}

export class RPCImpl implements RPC {
    private readonly locals = new Map<string, any>();
    private readonly proxies = new Map<string, any>();
    private lastMessageId = 0;
    private readonly cancellationTokenSources = new Map<string, CancellationTokenSource>();
    private readonly pendingRPCReplies = new Map<string, Deferred<any>>();
    private readonly multiplexer: RPCMultiplexer;
    private readonly readyDeferred = new Deferred<void>();

    private replacer: (key: string | undefined, value: any) => any;
    private reviver: (key: string | undefined, value: any) => any;

    private readonly toDispose = new DisposableCollection(
        Disposable.create(() => {
            /* mark as no disposed */
        })
    );

    constructor(
        connection: MessageConnection,
        transformations?: {
            replacer?: (key: string | undefined, value: any) => any;
            reviver?: (key: string | undefined, value: any) => any;
        }
    ) {
        this.toDispose.push((this.multiplexer = new RPCMultiplexer(connection)));
        this.multiplexer.onMessage(msg => this.receiveOneMessage(msg));
        this.toDispose.push(
            Disposable.create(() => {
                this.proxies.clear();
                for (const reply of this.pendingRPCReplies.values()) {
                    reply.reject(ConnectionClosedError.create());
                }
                this.pendingRPCReplies.clear();
            })
        );

        this.reviver = transformations?.reviver || ObjectsTransferrer.reviver;
        this.replacer = transformations?.replacer || ObjectsTransferrer.replacer;
        this.connect();
    }

    protected async connect(): Promise<void> {
        let count = 0;
        const task = setInterval(() => {
            const callId = String(++this.lastMessageId);
            this.multiplexer.send(this.open(callId));
            count++;
            if (count > 300) {
                clearInterval(task);
            }
        }, 500);
        await this.readyDeferred.promise;
        clearInterval(task);
    }

    private get isDisposed(): boolean {
        return this.toDispose.disposed;
    }

    dispose(): void {
        this.toDispose.dispose();
    }

    getProxy<T>(proxyId: ProxyIdentifier<T>): T {
        if (this.isDisposed) {
            throw ConnectionClosedError.create();
        }
        let proxy = this.proxies.get(proxyId.id);
        if (!proxy) {
            proxy = this.createProxy(proxyId.id);
            this.proxies.set(proxyId.id, proxy);
        }
        return proxy;
    }

    getLocal<T>(proxyId: ProxyIdentifier<T>): T {
        if (this.isDisposed) {
            throw ConnectionClosedError.create();
        }
        return this.locals.get(proxyId.id) as T;
    }

    set<T, R extends T>(identifier: ProxyIdentifier<T>, instance: R): R {
        if (this.isDisposed) {
            throw ConnectionClosedError.create();
        }
        this.locals.set(identifier.id, instance);
        if (Disposable.is(instance)) {
            this.toDispose.push(instance);
        }
        this.toDispose.push(Disposable.create(() => this.locals.delete(identifier.id)));
        return instance;
    }

    private createProxy<T>(proxyId: string): T {
        const handler = {
            get: (target: any, name: string) => {
                if (!target[name]) {
                    target[name] = (...myArgs: any[]) => this.remoteCall(proxyId, name, myArgs);
                }
                return target[name];
            },
        };
        return new Proxy(Object.create(null), handler); // eslint-disable-line no-null/no-null
    }

    private remoteCall(proxyId: string, methodName: string, args: any[]): Promise<any> {

        if (this.isDisposed) {
            return Promise.reject(ConnectionClosedError.create());
        }
        return this.readyDeferred.promise.then(() => {
            const cancellationToken: CancellationToken | undefined =
            args.length && isCancellationToken(args[args.length - 1]) ? args.pop() : undefined;
            if (cancellationToken && cancellationToken.isCancellationRequested) {
                return Promise.reject(canceled());
            }

            const callId = String(++this.lastMessageId);
            const result = new Deferred();

            if (cancellationToken) {
                args.push('add.cancellation.token');
                cancellationToken.onCancellationRequested(() => this.multiplexer.send(this.cancel(callId)));
            }

            this.pendingRPCReplies.set(callId, result);
            this.multiplexer.send(this.request(callId, proxyId, methodName, args));
            return result.promise;
        });

    }

    private receiveOneMessage(rawmsg: string): void {
        if (this.isDisposed) {
            return;
        }
        try {
            const msg = <RPCMessage>JSON.parse(rawmsg, this.reviver);

            switch (msg.type) {
                case MessageType.Request:
                    this.receiveRequest(msg);
                    break;
                case MessageType.Reply:
                    this.receiveReply(msg);
                    break;
                case MessageType.ReplyErr:
                    this.receiveReplyErr(msg);
                    break;
                case MessageType.Cancel:
                    this.receiveCancel(msg);
                    break;
                case MessageType.Open:
                    this.receiveOpen(msg);
                    break;
                case MessageType.Ready:
                    this.receiveReady(msg);
                    break;
            }
        } catch (e) {
            // exception does not show problematic content: log it!
            console.log('failed to parse message: ' + rawmsg);
            throw e;
        }
    }

    private receiveOpen(msg: OpenMessage): void {
        this.multiplexer.send(this.replyReady(msg.id));
    }

    private receiveReady(msg: ReadyMessage): void {
        this.readyDeferred.resolve();
    }

    private receiveCancel(msg: CancelMessage): void {
        const cancellationTokenSource = this.cancellationTokenSources.get(msg.id);
        if (cancellationTokenSource) {
            cancellationTokenSource.cancel();
        }
    }

    private receiveRequest(msg: RequestMessage): void {
        const callId = msg.id;
        const proxyId = msg.proxyId;
        // convert `null` to `undefined`, since we don't use `null` in internal plugin APIs
        const args = msg.args.map(arg => (arg === null ? undefined : arg)); // eslint-disable-line no-null/no-null

        const addToken = args.length && args[args.length - 1] === 'add.cancellation.token' ? args.pop() : false;
        if (addToken) {
            const tokenSource = new CancellationTokenSource();
            this.cancellationTokenSources.set(callId, tokenSource);
            args.push(tokenSource.token);
        }
        const invocation = this.invokeHandler(proxyId, msg.method, args);

        invocation.then(
            result => {
                this.cancellationTokenSources.delete(callId);
                this.multiplexer.send(this.replyOK(callId, result));
            },
            error => {
                this.cancellationTokenSources.delete(callId);
                this.multiplexer.send(this.replyErr(callId, error));
            }
        );
    }

    private receiveReply(msg: ReplyMessage): void {
        const callId = msg.id;
        const pendingReply = this.pendingRPCReplies.get(callId);
        if (!pendingReply) {
            return;
        }
        this.pendingRPCReplies.delete(callId);
        pendingReply.resolve(msg.res);
    }

    private receiveReplyErr(msg: ReplyErrMessage): void {
        const callId = msg.id;
        const pendingReply = this.pendingRPCReplies.get(callId);
        if (!pendingReply) {
            return;
        }
        this.pendingRPCReplies.delete(callId);

        let err: Error | undefined = undefined;
        if (msg.err && msg.err.$isError) {
            err = new Error();
            err.name = msg.err.name;
            err.message = msg.err.message;
            err.stack = msg.err.stack;
        }
        pendingReply.reject(err);
    }

    private invokeHandler(proxyId: string, methodName: string, args: any[]): Promise<any> {
        try {
            return Promise.resolve(this.doInvokeHandler(proxyId, methodName, args));
        } catch (err) {
            return Promise.reject(err);
        }
    }

    private doInvokeHandler(proxyId: string, methodName: string, args: any[]): any {
        const actor = this.locals.get(proxyId);
        if (!actor) {
            throw new Error('Unknown actor ' + proxyId);
        }
        const method = actor[methodName];
        if (typeof method !== 'function') {
            throw new Error('Unknown method ' + methodName + ' on actor ' + proxyId);
        }
        return method.apply(actor, args);
    }

    private cancel(req: string): string {
        return `{"type":${MessageType.Cancel},"id":"${req}"}`;
    }

    private open(req: string): string {
        return `{"type":${MessageType.Open},"id":"${req}"}`;
    }

    private request(req: string, rpcId: string, method: string, args: any[]): string {
        return `{"type":${MessageType.Request},"id":"${req}","proxyId":"${rpcId}","method":"${method}","args":${JSON.stringify(args, this.replacer)}}`;
    }

    private replyReady(req: string): string {
        return `{"type":${MessageType.Ready},"id":"${req}"}`;

    }

    private replyOK(req: string, res: any): string {
        if (typeof res === 'undefined') {
            return `{"type":${MessageType.Reply},"id":"${req}"}`;
        }
        return `{"type":${MessageType.Reply},"id":"${req}","res":${safeStringify(
            res,
            this.replacer
        )}}`;
    }

    private replyErr(req: string, err: any): string {
        err = typeof err === 'string' ? new Error(err) : err;
        if (err instanceof Error) {
            return `{"type":${MessageType.ReplyErr},"id":"${req}","err":${safeStringify(
                transformErrorForSerialization(err)
            )}}`;
        }
        return `{"type":${MessageType.ReplyErr},"id":"${req}","err":null}`;
    }
}

function canceled(): Error {
    const error = new Error('Canceled');
    error.name = error.message;
    return error;
}

export function transformErrorForSerialization(error: Error): SerializedError {
    if (error instanceof Error) {
        const { name, message } = error;
        const stack: string = (<any>error).stacktrace || error.stack;
        return {
            $isError: true,
            name,
            message,
            stack,
        };
    }

    // return as is
    return error;
}

interface JSONStringifyReplacer {
    (key: string, value: any): any;
}

function safeStringify(obj: any, replacer?: JSONStringifyReplacer): string {
    try {
        return JSON.stringify(obj, replacer);
    } catch (err) {
        console.error('error stringifying response: ', err);
        return 'null';
    }
}
