/* eslint-disable @typescript-eslint/no-shadow */
import { CancellationError, CancellationToken, CancellationTokenSource } from './cancellation';
import { Disposable } from './disposable';
import { Emitter } from './emitter';
import { Event } from './event';

interface Thenable<T> {
    then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => TResult | Thenable<TResult>): Thenable<TResult>;
    then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => void): Thenable<TResult>;
}

export function isThenable<T>(obj: unknown): obj is Promise<T> {
    return !!obj && typeof (obj as unknown as Promise<T>).then === 'function';
}

export interface CancelablePromise<T> extends Promise<T> {
    cancel(): void;
}

export function createCancelablePromise<T>(callback: (token: CancellationToken) => Promise<T>): CancelablePromise<T> {
    const source = new CancellationTokenSource();

    const thenable = callback(source.token);
    const promise = new Promise<T>((resolve, reject) => {
        const subscription = source.token.onCancellationRequested(() => {
            subscription.dispose();
            source.dispose();
            reject(new CancellationError());
        });
        Promise.resolve(thenable).then(value => {
            subscription.dispose();
            source.dispose();
            resolve(value);
        }, err => {
            subscription.dispose();
            source.dispose();
            reject(err);
        });
    });

    return <CancelablePromise<T>>new class {
        cancel() {
            source.cancel();
        }
        then<TResult1 = T, TResult2 = never>(resolve?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | undefined,
            reject?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | undefined): Promise<TResult1 | TResult2> {
            return promise.then(resolve, reject);
        }
        catch<TResult = never>(reject?: ((reason: any) => TResult | Promise<TResult>) | undefined | undefined): Promise<T | TResult> {
            return this.then(undefined, reject);
        }
        finally(onfinally?: (() => void) | undefined | undefined): Promise<T> {
            return promise.finally(onfinally);
        }
    };
}

export function raceCancellation<T>(promise: Promise<T>, token: CancellationToken): Promise<T | undefined>;

export function raceCancellation<T>(promise: Promise<T>, token: CancellationToken, defaultValue: T): Promise<T>;

export function raceCancellation<T>(promise: Promise<T>, token: CancellationToken, defaultValue?: T): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        const ref = token.onCancellationRequested(() => {
            ref.dispose();
            resolve(defaultValue);
        });
        promise.then(resolve, reject).finally(() => ref.dispose());
    });
}

export function raceCancellationError<T>(promise: Promise<T>, token: CancellationToken): Promise<T> {
    return new Promise((resolve, reject) => {
        const ref = token.onCancellationRequested(() => {
            ref.dispose();
            reject(new CancellationError());
        });
        promise.then(resolve, reject).finally(() => ref.dispose());
    });
}

export async function raceCancellablePromises<T>(cancellablePromises: CancelablePromise<T>[]): Promise<T> {
    let resolvedPromiseIndex = -1;
    const promises = cancellablePromises.map((promise, index) => promise.then(result => { resolvedPromiseIndex = index; return result; }));
    const result = await Promise.race(promises);
    cancellablePromises.forEach((cancellablePromise, index) => {
        if (index !== resolvedPromiseIndex) {
            cancellablePromise.cancel();
        }
    });
    return result;
}

export function raceTimeout<T>(promise: Promise<T>, timeout: number, onTimeout?: () => void): Promise<T | undefined> {
    let promiseResolve: ((value: T | undefined) => void) | undefined = undefined;

    const timer = setTimeout(() => {
        promiseResolve?.(undefined);
        onTimeout?.();
    }, timeout);

    return Promise.race([
        promise.finally(() => clearTimeout(timer)),
        new Promise<T | undefined>(resolve => promiseResolve = resolve)
    ]);
}

export function asPromise<T>(callback: () => T | Thenable<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const item = callback();
        if (isThenable<T>(item)) {
            item.then(resolve, reject);
        } else {
            resolve(item);
        }
    });
}

export interface ITask<T> {
    (): T;
}

/**
 * A helper to prevent accumulation of sequential async tasks.
 *
 * Imagine a mail man with the sole task of delivering letters. As soon as
 * a letter submitted for delivery, he drives to the destination, delivers it
 * and returns to his base. Imagine that during the trip, N more letters were submitted.
 * When the mail man returns, he picks those N letters and delivers them all in a
 * single trip. Even though N+1 submissions occurred, only 2 deliveries were made.
 *
 * The throttler implements this via the queue() method, by providing it a task
 * factory. Following the example:
 *
 *         const throttler = new Throttler();
 *         const letters = [];
 *
 *         function deliver() {
 *             const lettersToDeliver = letters;
 *             letters = [];
 *             return makeTheTrip(lettersToDeliver);
 *         }
 *
 *         function onLetterReceived(l) {
 *             letters.push(l);
 *             throttler.queue(deliver);
 *         }
 */
export class Throttler {

    private activePromise: Promise<any> | undefined;
    private queuedPromise: Promise<any> | undefined;
    private queuedPromiseFactory: ITask<Promise<any>> | undefined;

    constructor() {
        this.activePromise = undefined;
        this.queuedPromise = undefined;
        this.queuedPromiseFactory = undefined;
    }

    queue<T>(promiseFactory: ITask<Promise<T>>): Promise<T> {
        if (this.activePromise) {
            this.queuedPromiseFactory = promiseFactory;

            if (!this.queuedPromise) {
                const onComplete = () => {
                    this.queuedPromise = undefined;

                    const result = this.queue(this.queuedPromiseFactory!);
                    this.queuedPromiseFactory = undefined;

                    return result;
                };

                this.queuedPromise = new Promise(resolve => {
                    this.activePromise!.then(onComplete, onComplete).then(resolve);
                });
            }

            return new Promise((resolve, reject) => {
                this.queuedPromise!.then(resolve, reject);
            });
        }

        this.activePromise = promiseFactory();

        return new Promise((resolve, reject) => {
            this.activePromise!.then((result: T) => {
                this.activePromise = undefined;
                resolve(result);
            }, (err: unknown) => {
                this.activePromise = undefined;
                reject(err);
            });
        });
    }
}

export class Sequencer {

    private current: Promise<unknown> = Promise.resolve(undefined);

    queue<T>(promiseTask: ITask<Promise<T>>): Promise<T> {
        return this.current = this.current.then(() => promiseTask(), () => promiseTask());
    }
}

export class SequencerByKey<TKey> {

    private promiseMap = new Map<TKey, Promise<unknown>>();

    queue<T>(key: TKey, promiseTask: ITask<Promise<T>>): Promise<T> {
        const runningPromise = this.promiseMap.get(key) ?? Promise.resolve();
        const newPromise = runningPromise
            .catch(() => { })
            .then(promiseTask)
            .finally(() => {
                if (this.promiseMap.get(key) === newPromise) {
                    this.promiseMap.delete(key);
                }
            });
        this.promiseMap.set(key, newPromise);
        return newPromise;
    }
}

interface IScheduledLater extends Disposable {
    isTriggered(): boolean;
}

const timeoutDeferred = (timeout: number, fn: () => void): IScheduledLater => {
    let scheduled = true;
    const handle = setTimeout(() => {
        scheduled = false;
        fn();
    }, timeout);
    return {
        isTriggered: () => scheduled,
        dispose: () => {
            clearTimeout(handle);
            scheduled = false;
        },
    };
};

const microtaskDeferred = (fn: () => void): IScheduledLater => {
    let scheduled = true;
    queueMicrotask(() => {
        if (scheduled) {
            scheduled = false;
            fn();
        }
    });

    return {
        isTriggered: () => scheduled,
        dispose: () => { scheduled = false; },
    };
};

/** Can be passed into the Delayed to defer using a microtask */
export const MicrotaskDelay = Symbol('MicrotaskDelay');

/**
 * A helper to delay (debounce) execution of a task that is being requested often.
 *
 * Following the throttler, now imagine the mail man wants to optimize the number of
 * trips proactively. The trip itself can be long, so he decides not to make the trip
 * as soon as a letter is submitted. Instead he waits a while, in case more
 * letters are submitted. After said waiting period, if no letters were submitted, he
 * decides to make the trip. Imagine that N more letters were submitted after the first
 * one, all within a short period of time between each other. Even though N+1
 * submissions occurred, only 1 delivery was made.
 *
 * The delayer offers this behavior via the trigger() method, into which both the task
 * to be executed and the waiting period (delay) must be passed in as arguments. Following
 * the example:
 *
 *         const delayer = new Delayer(WAITING_PERIOD);
 *         const letters = [];
 *
 *         function letterReceived(l) {
 *             letters.push(l);
 *             delayer.trigger(() => { return makeTheTrip(); });
 *         }
 */
export class Delayer<T> implements Disposable {

    private deferred: IScheduledLater | undefined;
    private completionPromise: Promise<any> | undefined;
    private doResolve: ((value?: any | Promise<any>) => void) | undefined;
    private doReject: ((err: any) => void) | undefined;
    private task: ITask<T | Promise<T>> | undefined;

    constructor(public defaultDelay: number | typeof MicrotaskDelay) {
        this.deferred = undefined;
        this.completionPromise = undefined;
        this.doResolve = undefined;
        this.doReject = undefined;
        this.task = undefined;
    }

    trigger(task: ITask<T | Promise<T>>, delay = this.defaultDelay): Promise<T> {
        this.task = task;
        this.cancelTimeout();

        if (!this.completionPromise) {
            this.completionPromise = new Promise((resolve, reject) => {
                this.doResolve = resolve;
                this.doReject = reject;
            }).then(() => {
                this.completionPromise = undefined;
                this.doResolve = undefined;
                if (this.task) {
                    const task = this.task;
                    this.task = undefined;
                    return task();
                }
                return undefined;
            });
        }

        const fn = () => {
            this.deferred = undefined;
            this.doResolve?.(undefined);
        };

        this.deferred = delay === MicrotaskDelay ? microtaskDeferred(fn) : timeoutDeferred(delay, fn);

        return this.completionPromise;
    }

    isTriggered(): boolean {
        return !!this.deferred?.isTriggered();
    }

    cancel(): void {
        this.cancelTimeout();

        if (this.completionPromise) {
            if (this.doReject) {
                this.doReject(new CancellationError());
            }
            this.completionPromise = undefined;
        }
    }

    private cancelTimeout(): void {
        this.deferred?.dispose();
        this.deferred = undefined;
    }

    dispose(): void {
        this.cancel();
    }
}

/**
 * A helper to delay execution of a task that is being requested often, while
 * preventing accumulation of consecutive executions, while the task runs.
 *
 * The mail man is clever and waits for a certain amount of time, before going
 * out to deliver letters. While the mail man is going out, more letters arrive
 * and can only be delivered once he is back. Once he is back the mail man will
 * do one more trip to deliver the letters that have accumulated while he was out.
 */
export class ThrottledDelayer<T> {

    private delayer: Delayer<Promise<T>>;
    private throttler: Throttler;

    constructor(defaultDelay: number) {
        this.delayer = new Delayer(defaultDelay);
        this.throttler = new Throttler();
    }

    trigger(promiseFactory: ITask<Promise<T>>, delay?: number): Promise<T> {
        return this.delayer.trigger(() => this.throttler.queue(promiseFactory), delay) as unknown as Promise<T>;
    }

    isTriggered(): boolean {
        return this.delayer.isTriggered();
    }

    cancel(): void {
        this.delayer.cancel();
    }

    dispose(): void {
        this.delayer.dispose();
    }
}

/**
 * A barrier that is initially closed and then becomes opened permanently.
 */
export class Barrier {

    private _isOpen: boolean;
    private _promise: Promise<boolean>;
    private _completePromise!: (v: boolean) => void;

    constructor() {
        this._isOpen = false;
        this._promise = new Promise<boolean>((c, e) => {
            this._completePromise = c;
        });
    }

    isOpen(): boolean {
        return this._isOpen;
    }

    open(): void {
        this._isOpen = true;
        this._completePromise(true);
    }

    wait(): Promise<boolean> {
        return this._promise;
    }
}

/**
 * A barrier that is initially closed and then becomes opened permanently after a certain period of
 * time or when open is called explicitly
 */
export class AutoOpenBarrier extends Barrier {

    private readonly _timeout: any;

    constructor(autoOpenTimeMs: number) {
        super();
        this._timeout = setTimeout(() => this.open(), autoOpenTimeMs);
    }

    override open(): void {
        clearTimeout(this._timeout);
        super.open();
    }
}

export function timeout(millis: number): CancelablePromise<void>;
export function timeout(millis: number, token: CancellationToken): Promise<void>;
export function timeout(millis: number, token?: CancellationToken): CancelablePromise<void> | Promise<void> {
    if (!token) {
        return createCancelablePromise(token => timeout(millis, token));
    }

    return new Promise((resolve, reject) => {
        const handle = setTimeout(() => {
            disposable.dispose();
            resolve();
        }, millis);
        const disposable = token.onCancellationRequested(() => {
            clearTimeout(handle);
            disposable.dispose();
            reject(new CancellationError());
        });
    });
}

export function disposableTimeout(handler: () => void, timeout = 0): Disposable {
    const timer = setTimeout(handler, timeout);
    return Disposable.create(() => clearTimeout(timer));
}

/**
 * Runs the provided list of promise factories in sequential order. The returned
 * promise will complete to an array of results from each promise.
 */

export function sequence<T>(promiseFactories: ITask<Promise<T>>[]): Promise<T[]> {
    const results: T[] = [];
    let index = 0;
    const len = promiseFactories.length;

    function next(): Promise<T> | undefined {
        return index < len ? promiseFactories[index++]() : undefined;
    }

    function thenHandler(result: any): Promise<any> {
        if (result !== undefined && result !== undefined) {
            results.push(result);
        }

        const n = next();
        if (n) {
            return n.then(thenHandler);
        }

        return Promise.resolve(results);
    }

    return Promise.resolve(undefined).then(thenHandler);
}

export function first<T>(promiseFactories: ITask<Promise<T>>[], shouldStop: (t: T) => boolean = t => !!t, defaultValue: T | undefined = undefined): Promise<T | undefined> {
    let index = 0;
    const len = promiseFactories.length;

    const loop: () => Promise<T | undefined> = () => {
        if (index >= len) {
            return Promise.resolve(defaultValue);
        }

        const factory = promiseFactories[index++];
        const promise = Promise.resolve(factory());

        return promise.then(result => {
            if (shouldStop(result)) {
                return Promise.resolve(result);
            }

            return loop();
        });
    };

    return loop();
}

/**
 * Returns the result of the first promise that matches the "shouldStop",
 * running all promises in parallel. Supports cancelable promises.
 */
export function firstParallel<T>(promiseList: Promise<T>[], shouldStop?: (t: T) => boolean, defaultValue?: T | undefined): Promise<T | undefined>;
export function firstParallel<T, R extends T>(promiseList: Promise<T>[], shouldStop: (t: T) => t is R, defaultValue?: R | undefined): Promise<R | undefined>;
export function firstParallel<T>(promiseList: Promise<T>[], shouldStop: (t: T) => boolean = t => !!t, defaultValue: T | undefined = undefined) {
    if (promiseList.length === 0) {
        return Promise.resolve(defaultValue);
    }

    let todo = promiseList.length;
    const finish = () => {
        todo = -1;
        for (const promise of promiseList) {
            (promise as Partial<CancelablePromise<T>>).cancel?.();
        }
    };

    return new Promise<T | undefined>((resolve, reject) => {
        for (const promise of promiseList) {
            promise.then(result => {
                if (--todo >= 0 && shouldStop(result)) {
                    finish();
                    resolve(result);
                } else if (todo === 0) {
                    resolve(defaultValue);
                }
            })
                .catch(err => {
                    if (--todo >= 0) {
                        finish();
                        reject(err);
                    }
                });
        }
    });
}

interface ILimitedTaskFactory<T> {
    factory: ITask<Promise<T>>;
    c: (value: T | Promise<T>) => void;
    e: (error?: unknown) => void;
}

export interface ILimiter<T> {

    readonly size: number;

    queue(factory: ITask<Promise<T>>): Promise<T>;
}

/**
 * A helper to queue N promises and run them all with a max degree of parallelism. The helper
 * ensures that at any time no more than M promises are running at the same time.
 */
export class Limiter<T> implements ILimiter<T> {

    private _size = 0;
    private runningPromises: number;
    private readonly maxDegreeOfParalellism: number;
    private readonly outstandingPromises: ILimitedTaskFactory<T>[];
    private readonly _onDrained: Emitter<void>;

    constructor(maxDegreeOfParalellism: number) {
        this.maxDegreeOfParalellism = maxDegreeOfParalellism;
        this.outstandingPromises = [];
        this.runningPromises = 0;
        this._onDrained = new Emitter<void>();
    }

    /**
     * An event that fires when every promise in the queue
     * has started to execute. In other words: no work is
     * pending to be scheduled.
     *
     * This is NOT an event that signals when all promises
     * have finished though.
     */
    get onDrained(): Event<void> {
        return this._onDrained.event;
    }

    get size(): number {
        return this._size;
    }

    queue(factory: ITask<Promise<T>>): Promise<T> {
        this._size++;

        return new Promise<T>((c, e) => {
            this.outstandingPromises.push({ factory, c, e });
            this.consume();
        });
    }

    private consume(): void {
        while (this.outstandingPromises.length && this.runningPromises < this.maxDegreeOfParalellism) {
            const iLimitedTask = this.outstandingPromises.shift()!;
            this.runningPromises++;

            const promise = iLimitedTask.factory();
            promise.then(iLimitedTask.c, iLimitedTask.e);
            promise.then(() => this.consumed(), () => this.consumed());
        }
    }

    private consumed(): void {
        this._size--;
        this.runningPromises--;

        if (this.outstandingPromises.length > 0) {
            this.consume();
        } else {
            this._onDrained.fire();
        }
    }

    dispose(): void {
        this._onDrained.dispose();
    }
}

/**
 * A queue is handles one promise at a time and guarantees that at any time only one promise is executing.
 */
export class Queue<T> extends Limiter<T> {

    constructor() {
        super(1);
    }
}

export class TimeoutTimer implements Disposable {
    private _token: any;

    constructor();
    constructor(runner: () => void, timeout: number);
    constructor(runner?: () => void, timeout?: number) {
        this._token = -1;

        if (typeof runner === 'function' && typeof timeout === 'number') {
            this.setIfNotSet(runner, timeout);
        }
    }

    dispose(): void {
        this.cancel();
    }

    cancel(): void {
        if (this._token !== -1) {
            clearTimeout(this._token);
            this._token = -1;
        }
    }

    cancelAndSet(runner: () => void, timeout: number): void {
        this.cancel();
        this._token = setTimeout(() => {
            this._token = -1;
            runner();
        }, timeout);
    }

    setIfNotSet(runner: () => void, timeout: number): void {
        if (this._token !== -1) {
            // timer is already set
            return;
        }
        this._token = setTimeout(() => {
            this._token = -1;
            runner();
        }, timeout);
    }
}

export class IntervalTimer implements Disposable {

    private _token: any;

    constructor() {
        this._token = -1;
    }

    dispose(): void {
        this.cancel();
    }

    cancel(): void {
        if (this._token !== -1) {
            clearInterval(this._token);
            this._token = -1;
        }
    }

    cancelAndSet(runner: () => void, interval: number): void {
        this.cancel();
        this._token = setInterval(() => {
            runner();
        }, interval);
    }
}

export class RunOnceScheduler {

    protected runner: ((...args: unknown[]) => void) | undefined;

    private timeoutToken: any;
    private timeout: number;
    private timeoutHandler: () => void;

    constructor(runner: (...args: any[]) => void, delay: number) {
        this.timeoutToken = -1;
        this.runner = runner;
        this.timeout = delay;
        this.timeoutHandler = this.onTimeout.bind(this);
    }

    /**
     * Dispose RunOnceScheduler
     */
    dispose(): void {
        this.cancel();
        this.runner = undefined;
    }

    /**
     * Cancel current scheduled runner (if any).
     */
    cancel(): void {
        if (this.isScheduled()) {
            clearTimeout(this.timeoutToken);
            this.timeoutToken = -1;
        }
    }

    /**
     * Cancel previous runner (if any) & schedule a new runner.
     */
    schedule(delay = this.timeout): void {
        this.cancel();
        this.timeoutToken = setTimeout(this.timeoutHandler, delay);
    }

    get delay(): number {
        return this.timeout;
    }

    set delay(value: number) {
        this.timeout = value;
    }

    /**
     * Returns true if scheduled.
     */
    isScheduled(): boolean {
        return this.timeoutToken !== -1;
    }

    private onTimeout() {
        this.timeoutToken = -1;
        if (this.runner) {
            this.doRun();
        }
    }

    protected doRun(): void {
        if (this.runner) {
            this.runner();
        }
    }
}

/**
 * Same as `RunOnceScheduler`, but doesn't count the time spent in sleep mode.
 * > **NOTE**: Only offers 1s resolution.
 *
 * When calling `setTimeout` with 3hrs, and putting the computer immediately to sleep
 * for 8hrs, `setTimeout` will fire **as soon as the computer wakes from sleep**. But
 * this scheduler will execute 3hrs **after waking the computer from sleep**.
 */
export class ProcessTimeRunOnceScheduler {

    private runner: (() => void) | undefined;
    private timeout: number;

    private counter: number;
    private intervalToken: any;
    private intervalHandler: () => void;

    constructor(runner: () => void, delay: number) {
        if (delay % 1000 !== 0) {
            console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
        }
        this.runner = runner;
        this.timeout = delay;
        this.counter = 0;
        this.intervalToken = -1;
        this.intervalHandler = this.onInterval.bind(this);
    }

    dispose(): void {
        this.cancel();
        this.runner = undefined;
    }

    cancel(): void {
        if (this.isScheduled()) {
            clearInterval(this.intervalToken);
            this.intervalToken = -1;
        }
    }

    /**
     * Cancel previous runner (if any) & schedule a new runner.
     */
    schedule(delay = this.timeout): void {
        if (delay % 1000 !== 0) {
            console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
        }
        this.cancel();
        this.counter = Math.ceil(delay / 1000);
        this.intervalToken = setInterval(this.intervalHandler, 1000);
    }

    /**
     * Returns true if scheduled.
     */
    isScheduled(): boolean {
        return this.intervalToken !== -1;
    }

    private onInterval() {
        this.counter--;
        if (this.counter > 0) {
            // still need to wait
            return;
        }

        // time elapsed
        clearInterval(this.intervalToken);
        this.intervalToken = -1;
        if (this.runner) {
            this.runner();
        }
    }
}

export class RunOnceWorker<T> extends RunOnceScheduler {
    private units: T[] = [];

    constructor(runner: (units: T[]) => void, timeout: number) {
        super(runner, timeout);
    }

    work(unit: T): void {
        this.units.push(unit);

        if (!this.isScheduled()) {
            this.schedule();
        }
    }

    protected override doRun(): void {
        const units = this.units;
        this.units = [];

        if (this.runner) {
            this.runner(units);
        }
    }

    override dispose(): void {
        this.units = [];

        super.dispose();
    }
}

export interface IThrottledWorkerOptions {

    /**
     * maximum of units the worker will pass onto handler at once
     */
    maxWorkChunkSize: number;

    /**
     * maximum of units the worker will keep in memory for processing
     */
    maxBufferedWork: number | undefined;

    /**
     * delay before processing the next round of chunks when chunk size exceeds limits
     */
    throttleDelay: number;
}

export async function retry<T>(task: ITask<Promise<T>>, delay: number, retries: number): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < retries; i++) {
        try {
            return await task();
        } catch (error) {
            lastError = error;

            await timeout(delay);
        }
    }

    throw lastError;
}

// #region Task Sequentializer

interface IPendingTask {
    taskId: number;
    cancel: () => void;
    promise: Promise<void>;
}

interface ISequentialTask {
    promise: Promise<void>;
    promiseResolve: () => void;
    promiseReject: (error: Error) => void;
    run: () => Promise<void>;
}

export interface ITaskSequentializerWithPendingTask {
    readonly pending: Promise<void>;
}

export class TaskSequentializer {
    private _pending?: IPendingTask;
    private _next?: ISequentialTask;

    hasPending(taskId?: number): this is ITaskSequentializerWithPendingTask {
        if (!this._pending) {
            return false;
        }

        if (typeof taskId === 'number') {
            return this._pending.taskId === taskId;
        }

        return !!this._pending;
    }

    get pending(): Promise<void> | undefined {
        return this._pending ? this._pending.promise : undefined;
    }

    cancelPending(): void {
        this._pending?.cancel();
    }

    setPending(taskId: number, promise: Promise<void>, onCancel?: () => void, ): Promise<void> {
        this._pending = { taskId, cancel: () => onCancel?.(), promise };

        promise.then(() => this.donePending(taskId), () => this.donePending(taskId));

        return promise;
    }

    private donePending(taskId: number): void {
        if (this._pending && taskId === this._pending.taskId) {

            // only set pending to done if the promise finished that is associated with that taskId
            this._pending = undefined;

            // schedule the next task now that we are free if we have any
            this.triggerNext();
        }
    }

    private triggerNext(): void {
        if (this._next) {
            const next = this._next;
            this._next = undefined;

            // Run next task and complete on the associated promise
            next.run().then(next.promiseResolve, next.promiseReject);
        }
    }

    setNext(run: () => Promise<void>): Promise<void> {

        // this is our first next task, so we create associated promise with it
        // so that we can return a promise that completes when the task has
        // completed.
        if (!this._next) {
            let promiseResolve: () => void;
            let promiseReject: (error: Error) => void;
            const promise = new Promise<void>((resolve, reject) => {
                promiseResolve = resolve;
                promiseReject = reject;
            });

            this._next = {
                run,
                promise,
                promiseResolve: promiseResolve!,
                promiseReject: promiseReject!
            };
        } else {
            this._next.run = run;
        }

        return this._next.promise;
    }
}

// #endregion

// #region

/**
 * The `IntervalCounter` allows to count the number
 * of calls to `increment()` over a duration of
 * `interval`. This utility can be used to conditionally
 * throttle a frequent task when a certain threshold
 * is reached.
 */
export class IntervalCounter {

    private lastIncrementTime = 0;

    private value = 0;

    constructor(private readonly interval: number, private readonly nowFn = () => Date.now()) { }

    increment(): number {
        const now = this.nowFn();

        // We are outside of the range of `interval` and as such
        // start counting from 0 and remember the time
        if (now - this.lastIncrementTime > this.interval) {
            this.lastIncrementTime = now;
            this.value = 0;
        }

        this.value++;

        return this.value;
    }
}

// #endregion

// #region

export type ValueCallback<T = unknown> = (value: T | Promise<T>) => void;

/**
 * Creates a promise whose resolution or rejection can be controlled imperatively.
 */
export class DeferredPromise<T> {

    private completeCallback!: ValueCallback<T>;
    private errorCallback!: (err: unknown) => void;
    private rejected = false;
    private resolved = false;

    public get isRejected() {
        return this.rejected;
    }

    public get isResolved() {
        return this.resolved;
    }

    public get isSettled() {
        return this.rejected || this.resolved;
    }

    public p: Promise<T>;

    constructor() {
        this.p = new Promise<T>((c, e) => {
            this.completeCallback = c;
            this.errorCallback = e;
        });
    }

    public complete(value: T) {
        return new Promise<void>(resolve => {
            this.completeCallback(value);
            this.resolved = true;
            resolve();
        });
    }

    public error(err: unknown) {
        return new Promise<void>(resolve => {
            this.errorCallback(err);
            this.rejected = true;
            resolve();
        });
    }

    public cancel() {
        new Promise<void>(resolve => {
            this.errorCallback(new CancellationError());
            this.rejected = true;
            resolve();
        });
    }
}

// #endregion

// #region Promises

export namespace Promises {

    /**
     * A drop-in replacement for `Promise.all` with the only difference
     * that the method awaits every promise to either fulfill or reject.
     *
     * Similar to `Promise.all`, only the first error will be returned
     * if any.
     */
    export async function settled<T>(promises: Promise<T>[]): Promise<T[]> {
        let firstError: Error | undefined = undefined;

        const result = await Promise.all(promises.map(promise => promise.then(value => value, error => {
            if (!firstError) {
                firstError = error;
            }

            return undefined; // do not rethrow so that other promises can settle
        })));

        if (typeof firstError !== 'undefined') {
            throw firstError;
        }

        return result as unknown as T[]; // cast is needed and protected by the `throw` above
    }

    /**
     * A helper to create a new `Promise<T>` with a body that is a promise
     * itself. By default, an error that raises from the async body will
     * end up as a unhandled rejection, so this utility properly awaits the
     * body and rejects the promise as a normal promise does without async
     * body.
     *
     * This method should only be used in rare cases where otherwise `async`
     * cannot be used (e.g. when callbacks are involved that require this).
     */
    export function withAsyncBody<T, E = Error>(bodyFn: (resolve: (value: T) => unknown, reject: (error: E) => unknown) => Promise<unknown>): Promise<T> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<T>(async (resolve, reject) => {
            try {
                await bodyFn(resolve, reject);
            } catch (error) {
                reject(error);
            }
        });
    }
}

// #endregion
