import { ConsoleLogger, Component, Autowired, Value } from '@malagu/core';
import { HttpHeaders, HttpMethod, MediaType, RestOperations } from '@malagu/web';
import { Logger } from 'vscode-jsonrpc';
import { ProxyCreator, ConnectionOptions } from './proxy-protocol';
import { EndpointResolver } from '../endpoint';
import { ConnnectionFactory, JsonRpcProxy, JsonRpcProxyFactory } from '../factory';
import { Channel, HttpChannel } from '../channal';
import { ErrorConverter } from '../converter';
import { ConnectionHandler } from '../handler';
import { AxiosRequestConfig } from 'axios';
import { XML_HTTP_REQUEST, X_REQUESTED_WITH } from '@malagu/web/lib/node';
import { ClientConfigProcessor } from '../processor';

@Component(ProxyCreator)
export class HttpProxyCreator implements ProxyCreator {

    protected channelIdSeq = 0;

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

    create<T extends object>(path: string, errorConverters?: ErrorConverter[], target?: object | undefined): JsonRpcProxy<T> {
        const factory = new JsonRpcProxyFactory<T>(target, errorConverters);
        this.endpointResolver.resolve(path).then(endpoint => this.listen({
            path: endpoint,
            onConnection: c => factory.listen(c)
        }));
        return factory.createProxy();
    }

    support(path: string): number {
        return 500;
    }

    listen(handler: ConnectionHandler, options?: ConnectionOptions): void {
        this.openChannel(handler.path, channel => {
            const connection = this.connnectionFactory.create(channel, this.createLogger());
            handler.onConnection(connection);
        }, options);
    }

    openChannel(path: string, handler: (channel: Channel) => void, options?: ConnectionOptions): void {
        this.doOpenChannel(path, handler, options);
    }

    protected doOpenChannel(path: string, handler: (channel: Channel) => void, options?: ConnectionOptions): void {
        const id = this.channelIdSeq++;
        const channel = this.createChannel(id, path);
        handler(channel);
    }

    protected createChannel(id: number, path: string): Channel {
        const parts = path.split('/');
        const serviceName = parts.pop();
        const endpoint = parts.join('/');
        const channel = new HttpChannel(id, async content => {
            const config: AxiosRequestConfig = {
                url: endpoint,
                method: HttpMethod.POST,
                data: content,
                headers: {
                    [HttpHeaders.CONTENT_TYPE]: MediaType.APPLICATION_JSON_UTF8,
                    [X_REQUESTED_WITH]: XML_HTTP_REQUEST
                },
                ...this.clientConfig
            };
            await this.clientConfigProcessor.process(config);
            const response = await this.restOperations.request(config);
            channel.handleMessage(response.data);
        }, serviceName);
        return channel;
    }

    protected createLogger(): Logger {
        return new ConsoleLogger();
    }

}
