import { Component } from '@malagu/core';
import { FaaSEventListener } from './event-protocol';

@Component(FaaSEventListener)
export class NoOpEventListener implements FaaSEventListener<{}> {
    async onTrigger(event: {}): Promise<void> {
        // NoOp
    }

}
