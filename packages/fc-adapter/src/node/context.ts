import {  Context } from '@malagu/core/lib/node/jsonrpc';
import * as getRawBody from 'raw-body';
import { HttpChannel } from '@malagu/core/lib/common/jsonrpc/http-channel';
import { Channel } from '@malagu/core/lib/common/jsonrpc/channel-protocol';

export type Callback = (err: Error | undefined, data: any) => void;

export abstract class AbstractContext implements Context {

    protected message: Channel.Message;

    constructor(public context: any) {
    }

    async getMessage(): Promise<Channel.Message> {
        if (!this.message) {
            this.message = JSON.parse(await this.doGetMessage());
        }
        return this.message;
    }

    protected abstract doGetMessage(): Promise<string>;

    abstract handleError(err: Error): Promise<void>;

    abstract handleMessage(message: string): Promise<void>;

    async createChannel(id: number): Promise<Channel> {
        return new HttpChannel(id, async content => {
            this.handleMessage(content);
        });
    }

    async handleChannels(channelFactory: () => Promise<Channel>): Promise<void> {
        await channelFactory();
    }

}

export class ApiGatewayContext extends AbstractContext {

    readonly request: any;

    constructor(public event: string, public context: any, public callback: Callback) {
        super(context);
        this.request = JSON.parse(event);
    }

    async doGetMessage(): Promise<string> {
        if (this.request.isBase64Encoded) {
            return Buffer.from(this.request.body).toString('base64');
        }
        return this.request.body;
    }

    async handleError(err: Error): Promise<void> {
        this.callback(err, undefined);
    }

    async handleMessage(message: string): Promise<void> {
        this.callback(undefined, {
            isBase64Encoded: false,
            statusCode: 200,
            body: message
        });
    }
}

export class HttpContext extends AbstractContext {

    constructor(public request: any, public response: any, public context: Context) {
        super(context);
    }

    async doGetMessage(): Promise<string> {
        return (await getRawBody(this.request)).toString();
    }
    async handleError(err: Error): Promise<void> {
        this.response.statusCode = 500;
        this.response.send(err.message);
    }
    async handleMessage(message: string): Promise<void> {
        this.response.send(message);
    }
}
export class EventContext extends AbstractContext {

    constructor(public event: string, public context: any, public callback: Callback) {
        super(context);
    }

    async doGetMessage(): Promise<string> {
        return this.event;
    }

    async handleError(err: Error): Promise<void> {
        this.callback(err, undefined);
    }

    async handleMessage(message: string): Promise<void> {
        this.callback(undefined, message);
    }

}
