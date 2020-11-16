import { Component } from '@malagu/core';
import { ClientConfigProcessor } from './processor-protocol';
import { AxiosRequestConfig } from 'axios';

@Component(ClientConfigProcessor)
export class NoOpClientConfigProcessor implements ClientConfigProcessor {

    async process(config: AxiosRequestConfig): Promise<void> {

    }

}
