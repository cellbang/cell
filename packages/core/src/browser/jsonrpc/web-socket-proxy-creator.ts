import { injectable, decorate, unmanaged } from 'inversify';
import { createWebSocketConnection, Logger, ConsoleLogger } from 'vscode-ws-jsonrpc/lib';
import { Emitter, Event } from 'vscode-jsonrpc';
import { WebSocketChannel } from '../../common/jsonrpc/web-socket-channel';
import { JsonRpcProxyFactory, JsonRpcProxy, ConnectionHandler } from '../../common/jsonrpc';
import { ConnectionOptions, ProxyCreator } from './proxy-protocol';
import { Channel } from '../../common/jsonrpc/channel-protocol';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Component, Value, ENDPOINT, RPC_PATH, Autowired, PathResolver } from '../../common';
const urlJoin = require('url-join');

decorate(injectable(), JsonRpcProxyFactory);
decorate(unmanaged(), JsonRpcProxyFactory, 0);

@Component(ProxyCreator)
export class WebSocketProxyCreator implements ProxyCreator {

    protected channelIdSeq = 0;
    protected socket: ReconnectingWebSocket;
    protected readonly channels = new Map<number, WebSocketChannel>();

    protected readonly onIncomingMessageActivityEmitter: Emitter<void> = new Emitter();
    public onIncomingMessageActivity: Event<void> = this.onIncomingMessageActivityEmitter.event;

    @Value(ENDPOINT)
    protected readonly endpoint: string;

    @Value(RPC_PATH)
    protected readonly rpcPath: string;

    @Autowired(PathResolver)
    protected pathResolver: PathResolver;

    protected async createWebSocketIfNeed(): Promise<void> {
        if (this.socket) {
            return;
        }
        const socket = this.createWebSocket(urlJoin(this.endpoint, await this.pathResolver.resolve(this.rpcPath)));
        socket.onerror = console.error;
        socket.onclose = ({ code, reason }) => {
            for (const channel of [...this.channels.values()]) {
                channel.close(code, reason);
            }
        };
        socket.onmessage = ({ data }) => {
            const message: Channel.Message = JSON.parse(data);
            const channel = this.channels.get(message.id);
            if (channel) {
                channel.handleMessage(message);
            } else {
                console.error('The ws channel does not exist', message.id);
            }
            this.onIncomingMessageActivityEmitter.fire(undefined);
        };
        this.socket = socket;
    }

    create<T extends object>(path: string, target?: object): JsonRpcProxy<T> {
        this.createWebSocketIfNeed();
        const factory = new JsonRpcProxyFactory<T>(target);
        this.listen({
            path,
            onConnection: c => factory.listen(c)
        });
        return factory.createProxy();
    }

    support(path: string): number {
        return this.endpoint && this.endpoint.startsWith('ws') ? 500 : 0;
    }

    listen(handler: ConnectionHandler, options?: ConnectionOptions): void {
        this.openChannel(handler.path, channel => {
            const connection = createWebSocketConnection(channel, this.createLogger());
            connection.onDispose(() => channel.close());
            handler.onConnection(connection);
        }, options);
    }

    openChannel(path: string, handler: (channel: WebSocketChannel) => void, options?: ConnectionOptions): void {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.doOpenChannel(path, handler, options);
        } else {
            const openChannel = () => {
                this.socket.removeEventListener('open', openChannel);
                this.openChannel(path, handler, options);
            };
            this.socket.addEventListener('open', openChannel);
        }
    }

    protected doOpenChannel(path: string, handler: (channel: WebSocketChannel) => void, options?: ConnectionOptions): void {
        const id = this.channelIdSeq++;
        const channel = this.createChannel(id);
        this.channels.set(id, channel);
        channel.onClose(() => {
            if (this.channels.delete(channel.id)) {
                const { reconnecting } = { reconnecting: true, ...options };
                if (reconnecting) {
                    this.openChannel(path, handler, options);
                }
            } else {
                console.error('The ws channel does not exist', channel.id);
            }
        });
        channel.onOpen(() => handler(channel));
        channel.open(path);
    }

    protected createChannel(id: number): WebSocketChannel {
        return new WebSocketChannel(id, async content => {
            if (this.socket.readyState < WebSocket.CLOSING) {
                this.socket.send(content);
            }
        });
    }

    protected createLogger(): Logger {
        return new ConsoleLogger();
    }

    protected createWebSocket(url: string): ReconnectingWebSocket {
        return new ReconnectingWebSocket(url, [], {
            maxReconnectionDelay: 10000,
            minReconnectionDelay: 1000,
            reconnectionDelayGrowFactor: 1.3,
            connectionTimeout: 10000,
            maxRetries: Infinity,
            debug: false
        });
    }

}
