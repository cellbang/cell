import { Channel } from '../../common';

export const ChannelStrategy = Symbol('ChannelStrategy');

export const CHANNEL_MIDDLEWARE_PRIORITY = 2100;

export const CURRENT_CHANNEL_STRATEGY_REQUEST_KEY = 'CurrentChannelStrategyRequest';

export interface ChannelStrategy {

    getMessage(): Promise<Channel.Message>;

    handleMessage(message: any): Promise<void>;

    createChannel(id: number): Promise<Channel>

    handleChannels(channelFactory: () => Promise<Channel>): Promise<void>;

    support(): Promise<boolean>;

}
