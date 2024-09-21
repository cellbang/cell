import { Disposable } from '@celljs/core/lib/common/utils/disposable';
import { CustomError } from '@celljs/core/lib/common/error';

import { Event } from '@celljs/core/lib/common/utils/event';
export { CancellationTokenSource } from '@celljs/core/lib/common/utils/cancellation';

export class ProxyIdentifier<T> {
    public readonly id: string;
    constructor(public readonly isMain: boolean, id: string | T) {
        // TODO this is nasty, rewrite this
        this.id = (id as any).toString();
    }
}

export function createProxyIdentifier<T>(identifier: string): ProxyIdentifier<T> {
    return new ProxyIdentifier(false, identifier);
}

export interface MessageConnection {
    send(msg: string): void;
    onMessage: Event<string>;
}

export const RPC = Symbol('RPC');
export interface RPC extends Disposable {
    /**
     * Returns a proxy to an object addressable/named in the iframe window or in the main window.
     */
    getProxy<T>(proxyId: ProxyIdentifier<T>): T;

    /**
     * Returns a local to an object addressable/named in the iframe window or in the main window.
     */
    getLocal<T>(proxyId: ProxyIdentifier<T>): T;

    /**
     * Register manually created instance.
     */
    set<T, R extends T>(identifier: ProxyIdentifier<T>, instance: R): R;
}

export interface ConnectionClosedError extends CustomError {
    code: 'RPC_PROTOCOL_CLOSED';
}
export namespace ConnectionClosedError {
    const code: ConnectionClosedError['code'] = 'RPC_PROTOCOL_CLOSED';
    export function create(message: string = 'connection is closed'): ConnectionClosedError {
        return Object.assign(new Error(message), { code });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function is(error: any): error is ConnectionClosedError {
        return !!error && typeof error === 'object' && 'code' in error && error['code'] === code;
    }
}

/**
 * These functions are responsible for correct transferring objects via rpc channel.
 *
 * To reach that some specific kind of objects is converted to json in some custom way
 * and then, after receiving, revived to objects again,
 * so there is feeling that object was transferred via rpc channel.
 *
 * To distinguish between regular and altered objects, field $type is added to altered ones.
 * Also value of that field specifies kind of the object.
 */
export namespace ObjectsTransferrer {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function replacer(key: string | undefined, value: any): any {
        return value;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function reviver(key: string | undefined, value: any): any {
        return value;
    }
}

export const enum MessageType {
    Request = 1,
    Reply = 2,
    ReplyErr = 3,
    Cancel = 4,
    Terminate = 5,
    Terminated = 6,
    Open = 7,
    Ready = 8
}

export class OpenMessage {
    type: MessageType.Open;
    id: string;
    channalId: number;
}

export class ReadyMessage {
    type: MessageType.Ready;
    id: string;
    channalId: number;
}

export class CancelMessage {
    type: MessageType.Cancel;
    id: string;
    channalId: number;
}

export class RequestMessage {
    type: MessageType.Request;
    id: string;
    channalId: number;
    proxyId: string;
    method: string;
    args: any[];
}

export class ReplyMessage {
    type: MessageType.Reply;
    id: string;
    channalId: number;
    res: any;
}

export class ReplyErrMessage {
    type: MessageType.ReplyErr;
    id: string;
    channalId: number;
    err: SerializedError;
}

export type RPCMessage = RequestMessage | ReplyMessage | ReplyErrMessage | CancelMessage | OpenMessage | ReadyMessage;

export interface SerializedError {
    readonly $isError: true;
    readonly name: string;
    readonly message: string;
    readonly stack: string;
}
