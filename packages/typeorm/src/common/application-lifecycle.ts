import { Component, ApplicationLifecycle, Application, Value, Autowired } from '@malagu/core';
import { DEFAULT_CONNECTION_NAME } from './constants';
import { DataSourceManager } from './data-source-manager';
import { EntityProvider } from './entity-provider';
import { createDataSources } from './utils';

@Component(ApplicationLifecycle)
export class TypeOrmApplicationLifecycle implements ApplicationLifecycle<Application> {

    @Value('malagu.typeorm')
    protected readonly options: any;

    @Autowired(DataSourceManager)
    protected readonly dataSourceManager: DataSourceManager;

    async onStart(app: Application): Promise<void> {
        const dataSources = this.dataSourceManager.dataSources;
        for (const dataSource of dataSources) {
            if (dataSource.isInitialized) {
                await dataSource.destroy();
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

        await createDataSources(configs);
    }

    onStop(app: Application): void {
        const dataSources = this.dataSourceManager.dataSources;
        for (const dataSource of dataSources) {
            if (dataSource.isInitialized) {
                dataSource.initialize();
            }
        }
    }

}
