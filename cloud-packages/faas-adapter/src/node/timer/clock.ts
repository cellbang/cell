import { Component } from '@celljs/core';
import { Emitter, Event } from './events';
import { Clock } from './timer-protocol';

@Component(Clock)
export class ClockImpl implements Clock {
    protected onTickEmitter = new Emitter<void>();

    get onTick(): Event<void> {
        return this.onTickEmitter.event;
    }

    async tick(): Promise<void> {
        await this.onTickEmitter.fire();
    }

}
