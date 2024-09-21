import { ContainerUtil } from '@celljs/core';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DataSourceManager } from '../common';

export async function getDataSource(name?: string) {
    const dataSourceManager = ContainerUtil.get(DataSourceManager);
    const dataSource = dataSourceManager.get(name);
    if (!dataSource.isInitialized) {
        await dataSource.initialize();
    }
    return dataSource;
}

export async function createDataSources(options: DataSourceOptions[]): Promise<DataSource[]> {
    const dataSourceManager = ContainerUtil.get(DataSourceManager);
    const dataSources = options.map(option => dataSourceManager.create(option));
    // Do not use Promise.all or test 8522 will produce a dangling sqlite connection
    for (const dataSource of dataSources) {
        await dataSource.initialize();
    }
    return dataSources;
}
