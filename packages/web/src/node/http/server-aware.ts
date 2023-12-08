import { Component } from '@malagu/core';
import { ServerAware } from './http-protocol';
import { Server } from 'http';

@Component(ServerAware)
export class EmptyServerAware implements ServerAware {

    async setServer(server: Server): Promise<void> {
        // NoOp
    }

}
