import { Component, Autowired, Value, PostConstruct } from '@malagu/core';
import { RestOperations } from '@malagu/http';
import { ProxyCreator } from './proxy-protocol';
import { EndpointResolver } from '../endpoint';
import { ConnnectionFactory, JsonRpcProxy } from '../factory';
import { Channel } from '../channal';
import { ErrorConverter } from '../converter';
import { AxiosRequestConfig } from 'axios';
import { ClientConfigProcessor } from '../processor';
import { HttpProxyCreator } from './http-proxy-creator';

@Component(ProxyCreator)
export class DelegatingHttpProxyCreator implements ProxyCreator {

    @Autowired(ConnnectionFactory)
    protected connnectionFactory: ConnnectionFactory<Channel>;

    @Autowired(EndpointResolver)
    protected endpointResolver: EndpointResolver;

    @Autowired(RestOperations)
    protected restOperations: RestOperations;

    @Autowired(ClientConfigProcessor)
    protected clientConfigProcessor: ClientConfigProcessor;

    @Value('malagu.rpc.client.config')
    protected readonly clientConfig: AxiosRequestConfig;

    @Value('malagu.rpc.merge.maxCount')
    protected readonly maxCount: number;

    @Value('malagu.rpc.merge.maxLength')
    protected readonly maxLength: number;

    @Value('malagu.rpc.merge.timerDelay')
    protected readonly timerDelay: number;

    @Value('malagu.rpc.merge.enabled')
    protected readonly enabled: boolean;

    protected delegate: ProxyCreator;

    @PostConstruct()
    protected init() {
        this.delegate = new HttpProxyCreator({
            connnectionFactory: this.connnectionFactory,
            endpointResolver: this.endpointResolver,
            restOperations: this.restOperations,
            clientConfigProcessor: this.clientConfigProcessor,
            clientConfig: this.clientConfig,
            merge: {
                maxCount: this.maxCount,
                maxLength: this.maxLength,
                timerDelay: this.timerDelay,
                enabled: this.enabled
            }
        });
    }

    create<T extends object>(path: string, errorConverters?: ErrorConverter[], target?: object | undefined): JsonRpcProxy<T> {
        return this.delegate.create(path, errorConverters, target);
    }

    support(path: string): number {
        return this.delegate.support(path);
    }
}
