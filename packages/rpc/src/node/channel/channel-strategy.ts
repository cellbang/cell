import { Channel, HttpChannel } from '../../common/channal';
import { ChannelStrategy, CURRENT_MESSAGE_COUNT_REQUEST_KEY, CURRENT_RESPONSE_MESSAGE_REQUEST_KEY } from './channel-protocol';
import { Component } from '@celljs/core';
import { Context } from '@celljs/web/lib/node';

@Component(ChannelStrategy)
export class HttpChannelStrategy implements ChannelStrategy {
    async getMessages(): Promise<Channel.Message[]> {
        let message = await Context.getRequest().body;
        if (!Array.isArray(message)) {
            message = [ message ];
        } else {
            const parsed: Channel.Message[] = [];
            for (const m of message) {
                parsed.push(JSON.parse(m));
            }
            message = parsed;
        }
        Context.setAttr(CURRENT_MESSAGE_COUNT_REQUEST_KEY, message.length);
        return message;
    }

    async createChannel(id: number): Promise<Channel> {
        return new HttpChannel(id, async content => {
            this.handleMessage(content);
        });
    }

    async handleMessage(message: string): Promise<void> {
        if (!this.consumeMessage(message)) {
            const deferred = Context.getResponse().body;
            const messages = Context.getAttr<string[]>(CURRENT_RESPONSE_MESSAGE_REQUEST_KEY);
            deferred.resolve(messages.length > 1 ? JSON.stringify(messages) : message);
        }
    }

    protected consumeMessage(message: string) {
        const messageCount = Context.getAttr<number>(CURRENT_MESSAGE_COUNT_REQUEST_KEY);
        Context.setAttr(CURRENT_MESSAGE_COUNT_REQUEST_KEY, messageCount - 1);
        let messages = Context.getAttr<string[]>(CURRENT_RESPONSE_MESSAGE_REQUEST_KEY);
        if (!messages) {
            messages = [];
            Context.setAttr(CURRENT_RESPONSE_MESSAGE_REQUEST_KEY, messages);
        }
        messages.push(message);
        if (messageCount - 1 <= 0) {
            return false;
        }
        return true;
    }

    async support(): Promise<boolean> {
        return Context.getCurrent() instanceof Context;
    }

}
