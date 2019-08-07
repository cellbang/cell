import { injectable } from 'inversify';
import { Deferred } from '../common/promise-uil';
import { Emitter, Event } from 'vscode-jsonrpc';

export type FrontendApplicationState =
    'init'
    | 'started'
    | 'attached_shell'
    | 'ready'
    | 'closing_window';

@injectable()
export class FrontendApplicationStateService {

    private _state: FrontendApplicationState = 'init';

    protected deferred: { [state: string]: Deferred<void> } = {};
    protected readonly stateChanged = new Emitter<FrontendApplicationState>();

    get state(): FrontendApplicationState {
        return this._state;
    }

    set state(state: FrontendApplicationState) {
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

    get onStateChanged(): Event<FrontendApplicationState> {
        return this.stateChanged.event;
    }

    reachedState(state: FrontendApplicationState): Promise<void> {
        if (this.deferred[state] === undefined) {
            this.deferred[state] = new Deferred();
        }
        return this.deferred[state].promise;
    }

    reachedAnyState(...states: FrontendApplicationState[]): Promise<void> {
        return Promise.race(states.map(s => this.reachedState(s)));
    }

}
