import { MessageConnection, ResponseError, Emitter, Event } from 'vscode-jsonrpc';
import { ConnectionHandler } from './handler';
import { ApplicationError } from '../application/application-error';
import { Disposable } from '../utils/disposable';

export type JsonRpcServer<Client> = Disposable & {
    /**
     * If this server is a proxy to a remote server then
     * a client is used as a local object
     * to handle JSON-RPC messages from the remote server.
     */
    setClient(client: Client | undefined): void;
};

export interface JsonRpcConnectionEventEmitter {
    readonly onDidOpenConnection: Event<void> ;
    readonly onDidCloseConnection: Event<void>;
}
export type JsonRpcProxy<T> = T & JsonRpcConnectionEventEmitter;

export class JsonRpcConnectionHandler<T extends object> implements ConnectionHandler {
    constructor(
        readonly path: string,
        readonly targetFactory: (proxy: JsonRpcProxy<T>) => any
    ) { }

    onConnection(connection: MessageConnection): void {
        const factory = new JsonRpcProxyFactory<T>(this.path);
        const proxy = factory.createProxy();
        factory.target = this.targetFactory(proxy);
        factory.listen(connection);
    }
}

export class JsonRpcProxyFactory<T extends object> implements ProxyHandler<T> {

    private static SET_CLIENT = 'setClient';
    private static ON_DID_OPEN_CONNECTION = 'onDidOpenConnection';
    private static ON_DID_CLOSE_CONNECTION = 'onDidCloseConnection';
    private readonly onDidOpenConnectionEmitter = new Emitter<void>();
    private readonly onDidCloseConnectionEmitter = new Emitter<void>();
    protected internalMethods: Map<string, () => any>;

    protected connectionPromiseResolve: (connection: MessageConnection) => void;
    protected connectionPromise: Promise<MessageConnection>;

    constructor(public target?: any) {
        this.waitForConnection();
    }

    protected waitForConnection(): void {
        this.connectionPromise = new Promise(resolve =>
            this.connectionPromiseResolve = resolve
        );
        this.connectionPromise.then(connection => {
            connection.onClose(() =>
                this.onDidCloseConnectionEmitter.fire(undefined)
            );
            this.onDidOpenConnectionEmitter.fire(undefined);
        });
    }

    protected registerMethods(connection: MessageConnection) {
        if (this.target) {
            for (const prop in this.target) {
                if (typeof this.target[prop] === 'function') {
                    connection.onRequest(prop, (...args) => this.onRequest(prop, ...args));
                    connection.onNotification(prop, (...args) => this.onNotification(prop, ...args));
                }
            }
        }
    }

    listen(connection: MessageConnection) {
        this.registerMethods(connection);
        connection.onDispose(() => this.waitForConnection());
        connection.listen();
        this.connectionPromiseResolve(connection);
    }

    protected async onRequest(method: string, ...args: any[]): Promise<any> {
        try {
            return await this.target[method](...args);
        } catch (error) {
            const e = this.serializeError(error);
            if (e instanceof ResponseError) {
                throw e;
            }
            const reason = e.message || '';
            const stack = e.stack || '';
            console.error(`Request ${method} failed with error: ${reason}`, stack);
            throw e;
        }
    }

    protected onNotification(method: string, ...args: any[]): void {
        this.target[method](...args);
    }

    createProxy(): JsonRpcProxy<T> {
        const proxy = new Proxy<T>(this as any, this);
        return proxy as any;
    }

    get(target: T, p: PropertyKey, receiver: any): any {
        const method = this.getInternalMethod(p.toString());
        if (method) {
            return method;
        }
        return this.createProxyMethod(p.toString());
    }

    protected getInternalMethod(method: string) {
        if (method === JsonRpcProxyFactory.SET_CLIENT) {
            return  (client: any) => this.target = client;
        }
        if (method === JsonRpcProxyFactory.ON_DID_OPEN_CONNECTION) {
            return this.onDidOpenConnectionEmitter.event;
        }
        if (method === JsonRpcProxyFactory.ON_DID_CLOSE_CONNECTION) {
            return this.onDidCloseConnectionEmitter.event;
        }
    }

    protected createProxyMethod(method: string) {
        const isNotify = this.isNotification(method);
        return async (...args: any[]) => {
            const capturedError = new Error(`Request '${method}' failed`);
            const connection =  await this.connectionPromise;
            if (isNotify) {
                connection.sendNotification(method, ...args);
            } else {
                try {
                    return await connection.sendRequest(method, ...args) as Promise<any>;
                } catch (err) {
                    throw this.deserializeError(capturedError, err);
                }
            }
        };
    }

    protected isNotification(p: PropertyKey): boolean {
        return p.toString().startsWith('notify') || p.toString().startsWith('on');
    }

    protected serializeError(e: any): any {
        if (ApplicationError.is(e)) {
            return new ResponseError(e.code, '',
                Object.assign({ kind: 'application' }, e.toJson())
            );
        }
        return e;
    }
    protected deserializeError(capturedError: Error, e: any): any {
        if (e instanceof ResponseError) {
            const capturedStack = capturedError.stack || '';
            if (e.data && e.data.kind === 'application') {
                const { stack, data, message } = e.data;
                return ApplicationError.fromJson(e.code, {
                    message: message || capturedError.message,
                    data,
                    stack: `${capturedStack}\nCaused by: ${stack}`
                });
            }
            e.stack = capturedStack;
        }
        return e;
    }

}
