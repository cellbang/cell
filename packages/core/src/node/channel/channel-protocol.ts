import { Channel } from '../../common/jsonrpc';
import ws = require('ws');

export const ChannelStrategy = Symbol('ChannelStrategy');

export interface ChannelStrategy {

    getMessage(): Promise<Channel.Message>;

    handleError(err: Error): Promise<void>;

    handleMessage(message: any): Promise<void>;

    createChannel(id: number): Promise<Channel>

    handleChannels(channelFactory: () => Promise<Channel>): Promise<void>;

}

export interface CheckAliveWS extends ws {
    alive: boolean;
}
