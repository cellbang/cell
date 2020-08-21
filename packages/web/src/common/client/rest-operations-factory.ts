import { RestOperationsFactory, RestOperations } from './client-protocol';
import axios, { AxiosRequestConfig } from 'axios';
import { Component, Value } from '@malagu/core';

@Component(RestOperationsFactory)
export class DefaultRestOperationsFactory implements RestOperationsFactory {

    @Value('malagu.client.config')
    protected readonly clientConfig: AxiosRequestConfig;

    create(): RestOperations {
        return axios.create(this.clientConfig);
    }

}
