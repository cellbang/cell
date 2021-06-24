import { Event } from './events';

export const Clock = Symbol('Clock');

export interface Clock {

    readonly onTick: Event<void>;

    tick(): Promise<void>;
}
