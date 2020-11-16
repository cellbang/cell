import { Channel } from '../../common';

export const ChannelStrategy = Symbol('ChannelStrategy');

export const CHANNEL_MIDDLEWARE_PRIORITY = 2100;

export const CURRENT_CHANNEL_STRATEGY_REQUEST_KEY = 'CurrentChannelStrategyRequest';
export const CURRENT_MESSAGE_COUNT_REQUEST_KEY = 'CurrentMessageCountRequest';
export const CURRENT_RESPONSE_MESSAGE_REQUEST_KEY = 'CurrentResponseMessageRequest';

export interface ChannelStrategy {

    getMessages(): Promise<Channel.Message[]>;

    handleMessage(message: any): Promise<void>;

    createChannel(id: number): Promise<Channel>

    support(): Promise<boolean>;

}
