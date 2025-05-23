import { Event } from './event';
import { Emitter } from './emitter';

export class CancellationError extends Error {
    constructor() {
        super('Canceled');
        this.name = this.message;
    }
}

export interface CancellationToken {
    readonly isCancellationRequested: boolean;
    /*
     * An event emitted when cancellation is requested
     * @event
     */
    readonly onCancellationRequested: Event<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const shortcutEvent: Event<void> = Object.freeze(Object.assign(function (callback: any, context?: any): any {
    const handle = setTimeout(callback.bind(context), 0);
    return { dispose(): void {
 clearTimeout(handle);
} };
}, { maxListeners: 0 }));

export namespace CancellationToken {

    export const None: CancellationToken = Object.freeze({
        isCancellationRequested: false,
        onCancellationRequested: Event.None
    });

    export const Cancelled: CancellationToken = Object.freeze({
        isCancellationRequested: true,
        onCancellationRequested: shortcutEvent
    });
}

class MutableToken implements CancellationToken {

    private _isCancelled = false;
    private _emitter: Emitter<void> | undefined;

    public cancel(): void {
        if (!this._isCancelled) {
            this._isCancelled = true;
            if (this._emitter) {
                this._emitter.fire(undefined);
                this._emitter = undefined;
            }
        }
    }

    get isCancellationRequested(): boolean {
        return this._isCancelled;
    }

    get onCancellationRequested(): Event<void> {
        if (this._isCancelled) {
            return shortcutEvent;
        }
        if (!this._emitter) {
            this._emitter = new Emitter<void>();
        }
        return this._emitter.event;
    }
}

export class CancellationTokenSource {

    private _token: CancellationToken;

    get token(): CancellationToken {
        if (!this._token) {
            // be lazy and create the token only when
            // actually needed
            this._token = new MutableToken();
        }
        return this._token;
    }

    cancel(): void {
        if (!this._token) {
            // save an object by returning the default
            // cancelled token when cancellation happens
            // before someone asks for the token
            this._token = CancellationToken.Cancelled;
        } else if (this._token !== CancellationToken.Cancelled) {
            (<MutableToken>this._token).cancel();
        }
    }

    dispose(): void {
        this.cancel();
    }
}

const cancelledMessage = 'Cancelled';

export function cancelled(): Error {
    return new Error(cancelledMessage);
}

export function isCancelled(err: Error | undefined): boolean {
    return !!err && err.message === cancelledMessage;
}

export function checkCancelled(token?: CancellationToken): void {
    if (!!token && token.isCancellationRequested) {
        throw cancelled();
    }
}
