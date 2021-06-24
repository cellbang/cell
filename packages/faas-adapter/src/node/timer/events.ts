import { Disposable } from '@malagu/core';

export interface Event<T> {

    (listener: (e: T) => any, disposables?: Disposable[]): Disposable;
}

export namespace Event {
    const disposable = { dispose() { } };
    export const None: Event<any> = function () { return disposable; };
}

class CallbackList {

    private callbacks?: Function[];

    add(callback: Function, bucket?: Disposable[]): void {
        if (!this.callbacks) {
            this.callbacks = [];
        }
        this.callbacks.push(callback);

        if (Array.isArray(bucket)) {
            bucket.push({ dispose: () => this.remove(callback) });
        }
    }

    public remove(callback: Function): void {
        if (!this.callbacks) {
            return;
        }

        for (let i = 0, len = this.callbacks.length; i < len; i++) {
            if (this.callbacks[i] === callback) {
                this.callbacks.splice(i, 1);
            }
        }
    }

    public invoke(...args: any[]): any[] {
        if (!this.callbacks) {
            return [];
        }

        const ret: any[] = [];
        const callbacks = this.callbacks.slice(0);

        for (let i = 0, len = callbacks.length; i < len; i++) {
            try {
                ret.push(callbacks[i].apply(this, args));
            } catch (e) {
                console.error(e);
            }
        }
        return ret;
    }

    public isEmpty(): boolean {
        return !this.callbacks || this.callbacks.length === 0;
    }

    public dispose(): void {
        this.callbacks = undefined;
    }
}

export class Emitter<T> {

    private static _noop = function () { };

    private _event: Event<T> | undefined;
    private callbacks: CallbackList | undefined;

    get event(): Event<T> {
        if (!this._event) {
            this._event = (listener: (e: T) => any, disposables?: Disposable[]) => {
                if (!this.callbacks) {
                    this.callbacks = new CallbackList();
                }
                this.callbacks.add(listener);

                const result: Disposable = {
                    dispose: () => {
                        if (!this.callbacks) {
                            // disposable is disposed after emitter is disposed.
                            return;
                        }

                        this.callbacks.remove(listener);
                        result.dispose = Emitter._noop;
                    }
                };
                if (Array.isArray(disposables)) {
                    disposables.push(result);
                }

                return result;
            };
        }
        return this._event;
    }

    async fire(event: T): Promise<void> {
        if (this.callbacks) {
            await Promise.all(this.callbacks.invoke.call(this.callbacks, event));
        }
    }

    dispose() {
        if (this.callbacks) {
            this.callbacks.dispose();
            this.callbacks = undefined;
        }
    }
}
