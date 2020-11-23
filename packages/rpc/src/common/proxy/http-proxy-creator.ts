import { ConsoleLogger, Component, Autowired, Value } from '@malagu/core';
import { HttpHeaders, HttpMethod, MediaType, RestOperations, XML_HTTP_REQUEST } from '@malagu/web';
import { Logger } from 'vscode-jsonrpc';
import { ProxyCreator, ConnectionOptions, RequestTaskMeta } from './proxy-protocol';
import { EndpointResolver } from '../endpoint';
import { ConnnectionFactory, JsonRpcProxy, JsonRpcProxyFactory } from '../factory';
import { Channel, HttpChannel } from '../channal';
import { ErrorConverter } from '../converter';
import { ConnectionHandler } from '../handler';
import { AxiosRequestConfig } from 'axios';
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

    @Value('malagu.rpc.merge.maxCount')
    protected readonly maxCount: number;

    @Value('malagu.rpc.merge.maxLength')
    protected readonly maxLength: number;

    @Value('malagu.rpc.merge.timerDelay')
    protected readonly timerDelay: number;

    @Value('malagu.rpc.merge.enabled')
    protected readonly enabled: boolean;

    protected requestMap = new Map<string, RequestTaskMeta>();
    protected channelMap = new Map<number, Channel>();

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
            if (this.enabled) {
                if (this.canMerge(endpoint, content)) {
                    this.pushContent(endpoint, content);
                } else {
                    this.executeTask(endpoint);
                    this.pushContent(endpoint, content);
                }
            } else {
                this.pushContent(endpoint, content);
                this.executeTask(endpoint);
            }

        }, serviceName);
        this.channelMap.set(id, channel);
        return channel;
    }

    protected executeTask(endpoint: string) {
        const meta = this.requestMap.get(endpoint);
        if (meta) {
            return meta.task();
        }
    }

    protected canMerge(endpoint: string, content: string) {
        const meta = this.requestMap.get(endpoint);
        if (meta) {
            if (meta.contentLength + content.length > this.maxLength ||
                meta.contents.length + 1 > this.maxCount) {
                return false;
            }
        }
        return true;
    }

    protected pushContent(endpoint: string, content: string) {
        let meta = this.requestMap.get(endpoint);
        if (!meta) {
            const task = this.createTask(endpoint);
            meta = {
                id: setTimeout(task, this.timerDelay),
                contents: [],
                contentLength: 0,
                task
            };
            this.requestMap.set(endpoint, meta);
        }
        meta.contents.push(content);
        meta.contentLength += content.length;
        return meta;
    }

    protected createTask(endpoint: string) {
        return async () => {
            const meta = this.requestMap.get(endpoint);
            if (!meta) {
                return;
            }
            clearTimeout(meta.id);
            const contents = meta.contents;
            this.requestMap.delete(endpoint);
            const config: AxiosRequestConfig = {
                url: endpoint,
                method: HttpMethod.POST,
                data: contents.length > 1 ? JSON.stringify(contents) : contents[0],
                headers: {
                    [HttpHeaders.CONTENT_TYPE]: MediaType.APPLICATION_JSON_UTF8,
                    [HttpHeaders.X_REQUESTED_WITH]: XML_HTTP_REQUEST
                },
                ...this.clientConfig
            };
            await this.clientConfigProcessor.process(config);
            const { data } = await this.restOperations.request(config);
            if (Array.isArray(data)) {
                for (const message of data) {
                    const parsed = JSON.parse(message);
                    this.channelMap.get(parsed.id)!.handleMessage(parsed);
                }
            } else {
                this.channelMap.get(data.id)!.handleMessage(data);
            }
        };
    }

    protected createLogger(): Logger {
        return new ConsoleLogger();
    }

}
