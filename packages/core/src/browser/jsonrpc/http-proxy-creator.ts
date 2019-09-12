import { Channel } from '../../common/jsonrpc/channel-protocol';
import { Logger } from 'vscode-jsonrpc';
import { ConsoleLogger } from '../../common/logger';
import { JsonRpcProxy, JsonRpcProxyFactory } from '../../common/jsonrpc/proxy-factory';
import { ConnectionHandler } from '../../common/jsonrpc/handler';
import { ConnnectionFactory } from '../../common/jsonrpc/connection-factory';
import { ProxyCreator, ConnectionOptions } from './proxy-protocol';
import { HttpChannel } from '../../common/jsonrpc/http-channel';
import { Component, Autowired, Value } from '../../common/annotation';
const urlJoin = require('url-join');

@Component(ProxyCreator)
export class HttpProxyCreator implements ProxyCreator {

    protected channelIdSeq = 0;
    protected readonly channels = new Map<number, Channel>();

    @Autowired(ConnnectionFactory)
    protected connnectionFactory: ConnnectionFactory<Channel>;

    @Value
    protected readonly endpoint: string;

    @Value
    protected readonly rpcPath: string;

    create<T extends object>(path: string, target?: object | undefined): JsonRpcProxy<T> {
        const factory = new JsonRpcProxyFactory<T>(target);
        this.listen({
            path,
            onConnection: c => factory.listen(c)
        });
        return factory.createProxy();
    }

    support(path: string): number {
        return this.endpoint && this.endpoint.startsWith('http') ? 500 : 0;
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
        this.channels.set(id, channel);
        handler(channel);
    }

    protected createChannel(id: number, path: string): Channel {
        const channel = new HttpChannel(id, async content => {
            const response = await fetch(urlJoin(this.endpoint, this.rpcPath), {
                method: 'POST',
                body: content,
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            });
            channel.handleMessage(await response.json());
        }, path);
        return channel;
    }

    protected createLogger(): Logger {
        return new ConsoleLogger();
    }

}
