import { ConsoleLogger } from '@malagu/core/lib/common/logger';
import { RestOperations } from '@malagu/web/lib/common/client/client-protocol';
import { HttpHeaders, HttpMethod, MediaType, XML_HTTP_REQUEST } from '@malagu/web/lib/common/http';
import { Logger } from 'vscode-jsonrpc';
import { ProxyCreator, ConnectionOptions, RequestTaskMeta } from './proxy-protocol';
import { EndpointResolver } from '../endpoint';
import { ConnnectionFactory, ConnnectionFactoryImpl, JsonRpcProxy, JsonRpcProxyFactory } from '../factory';
import { Channel, HttpChannel } from '../channal';
import { ErrorConverter } from '../converter';
import { ConnectionHandler } from '../handler';
import { AxiosRequestConfig } from 'axios';
import { ClientConfigProcessor } from '../processor';
import { DefaultRestOperationsFactory } from '@malagu/web/lib/common/client';

export interface MergeOptions {
        maxCount: number;
        maxLength: number;
        timerDelay: number;
        enabled: boolean;
}

export interface HttpProxyCreatorOptions<T> {

    connnectionFactory: ConnnectionFactory<Channel>;
    endpointResolver: EndpointResolver;
    restOperations: RestOperations;
    clientConfigProcessor?: ClientConfigProcessor;
    clientConfig: AxiosRequestConfig;
    merge: T;
}

const DEFAULT_OPTIONS: Omit<HttpProxyCreatorOptions<MergeOptions>, 'endpointResolver'> = {
    connnectionFactory: new ConnnectionFactoryImpl(),
    restOperations: new DefaultRestOperationsFactory().create(),
    clientConfig: {},
    merge: {
        maxCount: 100,
        maxLength: 5242880,
        timerDelay: 35,
        enabled: false
    }

};

export class HttpProxyCreator implements ProxyCreator {

    protected channelIdSeq = 0;

    protected requestMap = new Map<string, RequestTaskMeta>();
    protected channelMap = new Map<number, Channel>();
    protected options: HttpProxyCreatorOptions<MergeOptions>;

    constructor(
        options: Partial<Omit<HttpProxyCreatorOptions<Partial<MergeOptions>>, 'endpointResolver'>> & Pick<HttpProxyCreatorOptions<Partial<MergeOptions>>, 'endpointResolver'>) {
        this.options = { ...DEFAULT_OPTIONS, ...options, merge: { ...DEFAULT_OPTIONS.merge, ...options.merge } };
    }

    create<T extends object>(path: string, errorConverters?: ErrorConverter[], target?: object | undefined): JsonRpcProxy<T> {
        const factory = new JsonRpcProxyFactory<T>(target, errorConverters);
        this.options.endpointResolver.resolve(path).then(endpoint => this.listen({
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
            const connection = this.options.connnectionFactory.create(channel, this.createLogger());
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
            if (this.options.merge.enabled) {
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
            if (meta.contentLength + content.length > this.options.merge.maxLength ||
                meta.contents.length + 1 > this.options.merge.maxCount) {
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
                id: setTimeout(task, this.options.merge.timerDelay),
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
            clearTimeout(meta.id as any);
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
                ...this.options.clientConfig
            };
            await this.options.clientConfigProcessor?.process(config);
            const { data } = await this.options.restOperations.request(config);
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
