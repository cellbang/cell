/* eslint-disable @typescript-eslint/no-explicit-any */

import { Disposable } from './disposable';

/**
 * Represents a typed event.
 */
export interface Event<T> {

    /**
     *
     * @param listener The listener function will be call when the event happens.
     * @param thisArgs The 'this' which will be used when calling the event listener.
     * @param disposables An array to which a {{IDisposable}} will be added.
     * @return a disposable to remove the listener again.
     */
    (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable;
    /**
     * An emitter will print a warning if more listeners are added for this event.
     * The event.maxListeners allows the limit to be modified for this specific event.
     * The value can be set to 0 to indicate an unlimited number of listener.
     */
    maxListeners: number
}

export namespace Event {
    const _disposable = { dispose(): void { } };
    export const None: Event<any> = Object.assign(function (): { dispose(): void } { return _disposable; }, {
        get maxListeners(): number { return 0; },
        set maxListeners(maxListeners: number) { }
    });

    /**
     * Given an event and a `map` function, returns another event which maps each element
     * through the mapping function.
     */
    export function map<I, O>(event: Event<I>, mapFunc: (i: I) => O): Event<O> {
        return Object.assign((listener: (e: O) => any, thisArgs?: any, disposables?: Disposable[]) => event(i => listener.call(thisArgs, mapFunc(i)), undefined, disposables), {
            maxListeners: 0,
        });
    }
}

export type Callback = (...args: any[]) => any;
export class CallbackList implements Iterable<Callback> {

    private _callbacks: Function[] | undefined;
    private _contexts: any[] | undefined;

    get length(): number {
        return this._callbacks && this._callbacks.length || 0;
    }

    public add(callback: Function, context: any = undefined, bucket?: Disposable[]): void {
        if (!this._callbacks) {
            this._callbacks = [];
            this._contexts = [];
        }
        this._callbacks.push(callback);
        this._contexts!.push(context);

        if (Array.isArray(bucket)) {
            bucket.push({ dispose: () => this.remove(callback, context) });
        }
    }

    public remove(callback: Function, context: any = undefined): void {
        if (!this._callbacks) {
            return;
        }

        let foundCallbackWithDifferentContext = false;
        for (let i = 0; i < this._callbacks.length; i++) {
            if (this._callbacks[i] === callback) {
                if (this._contexts![i] === context) {
                    // callback & context match => remove it
                    this._callbacks.splice(i, 1);
                    this._contexts!.splice(i, 1);
                    return;
                } else {
                    foundCallbackWithDifferentContext = true;
                }
            }
        }

        if (foundCallbackWithDifferentContext) {
            throw new Error('When adding a listener with a context, you should remove it with the same context');
        }
    }

    // tslint:disable-next-line:typedef
    public [Symbol.iterator]() {
        if (!this._callbacks) {
            return [][Symbol.iterator]();
        }
        const callbacks = this._callbacks.slice(0);
        const contexts = this._contexts!.slice(0);

        return callbacks.map((callback, i) =>
            (...args: any[]) => callback.apply(contexts[i], args)
        )[Symbol.iterator]();
    }

    public invoke(...args: any[]): any[] {
        const ret: any[] = [];
        for (const callback of this) {
            try {
                ret.push(callback(...args));
            } catch (e) {
                console.error(e);
            }
        }
        return ret;
    }

    public isEmpty(): boolean {
        return !this._callbacks || this._callbacks.length === 0;
    }

    public dispose(): void {
        this._callbacks = undefined;
        this._contexts = undefined;
    }
}
