import { Component } from '@malagu/core';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DataSourceNotFoundError, AlreadyHasActiveDataSourceError } from './errors';

/**
 * DataSourceManager is used to store and manage multiple orm dataSources.
 * It also provides useful factory methods to simplify dataSource creation.
 *
 */
@Component()
export class DataSourceManager {
    /**
     * List of dataSources registered in this dataSource manager.
     */
    get dataSources(): DataSource[] {
        return Array.from(this.dataSourceMap.values());
    }

    /**
     * Internal lookup to quickly get from a dataSource name to the DataSource object.
     */
    private readonly dataSourceMap: Map<string, DataSource> = new Map();

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    /**
     * Checks if dataSource with the given name exist in the manager.
     */
    has(name: string): boolean {
        return this.dataSourceMap.has(name);
    }

    /**
     * Gets registered dataSource with the given name.
     * If dataSource name is not given then it will get a default dataSource.
     * Throws error if dataSource with the given name was not found.
     */
    get(name: string = 'default'): DataSource {
        const dataSource = this.dataSourceMap.get(name);
        if (!dataSource) {
            throw new DataSourceNotFoundError(name);
        }

        return dataSource;
    }

    /**
     * Creates a new dataSource based on the given dataSource options and registers it in the manager.
     * DataSource won't be established, you'll need to manually call connect method to establish dataSource.
     */
    create(options: DataSourceOptions & { name?: string }): DataSource {

        const name = options.name || 'default';
        // check if such dataSource is already registered
        const existDataSource = this.dataSourceMap.get(name);
        if (existDataSource) {
            // if dataSource is registered and its not closed then throw an error
            if (existDataSource.isInitialized) {
                throw new AlreadyHasActiveDataSourceError(name);
            }
        }

        // create a new dataSource
        const dataSource = new DataSource(options);
        this.dataSourceMap.set(name, dataSource);
        return dataSource;
    }
}
