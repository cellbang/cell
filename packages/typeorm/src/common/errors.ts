import { TypeORMError } from 'typeorm';

/**
 * Thrown when consumer tries to get datasource that does not exist.
 */
export class DataSourceNotFoundError extends TypeORMError {
    constructor(name: string) {
        super(`DataSource "${name}" was not found.`);
    }
}

/**
 * Thrown when consumer tries to recreate datasource with the same name, but previous datasource was not closed yet.
 */
export class AlreadyHasActiveDataSourceError extends TypeORMError {
    constructor(DataSourceName: string) {
        super(
            `Cannot create a new DataSource named "${DataSourceName}", because DataSource with such name ` +
                'already exist and it now has an active DataSource session.',
        );
    }
}
