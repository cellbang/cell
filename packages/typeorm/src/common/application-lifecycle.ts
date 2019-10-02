import { Component, ApplicationLifecycle, Application, Value } from '@malagu/core';
import { createConnections, Connection } from 'typeorm';
import { DEFAULT_CONNECTION_NAME } from './constants';
import { EntityProvider } from './entity-provider';

@Component(ApplicationLifecycle)
export class TypeOrmApplicationLifecycle implements ApplicationLifecycle<Application> {

    @Value('malagu.typeorm')
    protected readonly options: any;

    protected connections: Connection[];

    async onStart(app: Application): Promise<void> {
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

        this.connections = await createConnections(configs);
    }

    onStop(app: Application): void {
        if (this.connections) {
            for (const connection of this.connections) {
                connection.close();
            }
        }
    }

}
