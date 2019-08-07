import { injectable, inject } from 'inversify';
import { Channel } from '../../common/jsonrpc/channel-protocol';
import { Logger } from 'vscode-jsonrpc';
import { ConsoleLogger } from '../../common/logger';
import { JsonRpcProxy, JsonRpcProxyFactory } from '../../common/jsonrpc/proxy-factory';
import { ConnectionHandler } from '../../common/jsonrpc/handler';
import { ConnnectionFactory } from '../../common/jsonrpc/connection-factory';
import { ProxyCreator, ENDPOINT, ConnectionOptions } from './proxy-protocol';
import { ConfigProvider } from '../../common/config-provider';
import { HttpChannel } from '../../common/jsonrpc/http-channel';

@injectable()
export class HttpProxyCreator implements ProxyCreator {

    protected channelIdSeq = 0;
    protected readonly channels = new Map<number, Channel>();

    @inject(ConnnectionFactory)
    protected connnectionFactory: ConnnectionFactory<Channel>;
    @inject(ConfigProvider)
    protected readonly configProvider: ConfigProvider;

    create<T extends object>(path: string, target?: object | undefined): JsonRpcProxy<T> {
        const factory = new JsonRpcProxyFactory<T>(target);
        this.listen({
            path,
            onConnection: c => factory.listen(c)
        });
        return factory.createProxy();
    }

    support(path: string): number {
        const endpoint = this.configProvider.get<string>(ENDPOINT);
        return endpoint && endpoint.startsWith('http') ? 500 : 0;
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
            const response = await fetch(this.configProvider.get<string>(ENDPOINT), {
                method: 'POST',
                body: content
            });
            channel.handleMessage(JSON.parse(await response.text()));
        }, path);
        return channel;
    }

    protected createLogger(): Logger {
        return new ConsoleLogger();
    }

}
