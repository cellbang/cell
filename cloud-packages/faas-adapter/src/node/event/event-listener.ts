import { Component } from '@celljs/core';
import { FaaSEventListener } from './event-protocol';

@Component(FaaSEventListener)
export class NoOpEventListener implements FaaSEventListener<{}, void> {
    async onTrigger(event: {}): Promise<void> {
        // NoOp
    }

}
