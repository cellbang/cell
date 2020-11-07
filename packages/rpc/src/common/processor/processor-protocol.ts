import { AxiosRequestConfig } from 'axios';

export const ClientConfigProcessor = Symbol('ClientConfigProcessor');

export interface ClientConfigProcessor {
    process(config: AxiosRequestConfig): Promise<void>;
}
