import { Component, ApplicationLifecycle, Application, Value } from '@malagu/core';
import { createConnections, getConnectionManager } from 'typeorm';
import { DEFAULT_CONNECTION_NAME } from './constants';
import { EntityProvider } from './entity-provider';

@Component(ApplicationLifecycle)
export class TypeOrmApplicationLifecycle implements ApplicationLifecycle<Application> {

    @Value('malagu.typeorm')
    protected readonly options: any;

    async onStart(app: Application): Promise<void> {
        const connections = getConnectionManager().connections;
        for (const c of connections) {
            if (c.isConnected) {
                await c.close();
            }
        }
        const { ormConfig } = this.options;
        let configs: any[];
        if (Array.isArray(ormConfig)) {
            configs = ormConfig;
        } else {
            ormConfig.name = DEFAULT_CONNECTION_NAME;
            configs = [ ormConfig ];
        }

        for (const config of configs) {
            config.entities = EntityProvider.getEntities(config.name) || [];
        }

        await createConnections(configs);
    }

    onStop(app: Application): void {
        const connections = getConnectionManager().connections;
        for (const c of connections) {
            if (c.isConnected) {
                c.close();
            }
        }
    }

}
