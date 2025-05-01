import { MaybePromise } from '../utils/prioritizeable';
import { Deferred } from '../utils/promise-util';
import { Event } from '../utils/event';
import { Emitter } from '../utils/emitter';
import { Logger } from '../logger/logger-protocol';
import { Autowired, Optional } from '../annotation';

export const ApplicationLifecycle = Symbol('ApplicationLifecycle');
export const Application = Symbol('Application');
export const ApplicationStateService = Symbol('ApplicationStateService');
export const ApplicationProps = Symbol('ApplicationProps');

export type ApplicationProps = Record<string, any>;

export interface ApplicationLifecycle<T extends Application> {

    initialize?(): void;

    onStart?(app: T): MaybePromise<void>;

    onStop?(app: T): void;

}

export interface Application {

    start(): Promise<void>;
    stop(): Promise<void>;

}

export abstract class AbstractApplication implements Application {

    @Autowired(ApplicationLifecycle) @Optional()
    protected readonly lifecycles: ApplicationLifecycle<Application>[];

    abstract start(): Promise<void>;

    abstract stop(): Promise<void>;

    @Autowired(Logger)
    protected readonly logger: Logger;

    /**
     * Initialize and start the frontend application.
     */
    protected async doStart(): Promise<void> {
        for (const lifecycle of this.lifecycles) {
            if (lifecycle.initialize) {
                try {
                    lifecycle.initialize();
                } catch (error) {
                    this.logger.error('Could not initialize lifecycle', error);
                }
            }
        }

        // TODO

        for (const lifecycle of this.lifecycles) {
            if (lifecycle.onStart) {
                try {
                    await lifecycle.onStart(this);
                } catch (error) {
                    this.logger.error('Could not start lifecycle', error);
                }
            }
        }
    }

    /**
     * Stop the frontend application lifecycle.
     */
    protected doStop(): void {
        for (const lifecycle of this.lifecycles) {
            if (lifecycle.onStop) {
                try {
                    lifecycle.onStop(this);
                } catch (error) {
                    this.logger.error('Could not stop lifecycle', error);
                }
            }
        }
    }

}

export type ApplicationState =
    'init'
    | 'started'
    | 'ready'
    | 'stoped';

export interface ApplicationStateService<T extends string> {
    state: T;
    readonly onStateChanged: Event<T>

    reachedState(state: T): Promise<void>;

    reachedAnyState(...states: T[]): Promise<void>;

}
export abstract class AbstractApplicationStateService<T extends string> implements ApplicationStateService<T> {

    private _state = <T>'init';

    protected deferred: { [state: string]: Deferred<void> } = {};
    protected readonly stateChanged = new Emitter<T>();

    get state(): T {
        return this._state;
    }

    set state(state: T) {
        if (state !== this._state) {
            this.deferred[this._state] = new Deferred();
            this._state = state;
            if (this.deferred[state] === undefined) {
                this.deferred[state] = new Deferred();
            }
            this.deferred[state].resolve();
            this.stateChanged.fire(state);
        }
    }

    get onStateChanged(): Event<T> {
        return this.stateChanged.event;
    }

    reachedState(state: T): Promise<void> {
        if (this.deferred[state] === undefined) {
            this.deferred[state] = new Deferred();
        }
        return this.deferred[state].promise;
    }

    reachedAnyState(...states: T[]): Promise<void> {
        return Promise.race(states.map(s => this.reachedState(s)));
    }

}
