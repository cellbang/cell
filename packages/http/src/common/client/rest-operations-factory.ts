import { RestOperationsFactory, RestOperations } from './client-protocol';
import axios, { AxiosRequestConfig } from 'axios';
import { Component, Value } from '@celljs/core';

@Component(RestOperationsFactory)
export class DefaultRestOperationsFactory implements RestOperationsFactory {

    @Value('cell.client.config')
    protected readonly clientConfig: AxiosRequestConfig;

    create(): RestOperations {
        return axios.create(this.clientConfig);
    }

}
