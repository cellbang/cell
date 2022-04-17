import { Component } from '@malagu/core';
import { FaaSEventListener } from '@malagu/faas-adapter';
import { join } from 'path';
import { createOpenAPI, createShort } from 'qq-guild-bot';
// eslint-disable-next-line no-eval
const localRequire = eval('require');
const { appID, token, intents, secret, eventMap } = localRequire(join(__dirname, 'bot-config.json'));

@Component(FaaSEventListener)
export class BotEventListener implements FaaSEventListener<any, any> {

    protected getConfig() {
        return {
            appID,
            secret,
            token,
            intents
        };
    }

    protected createAndBindClient() {
        const config = this.getConfig();
        const client = createOpenAPI(config);
        const short = createShort(config);
        (global as any).client = client;
        (global as any).short = short;
    }

    protected registerListeners() {
        const { short } = global as any;

        short.on('READY', (data: any) => {
            console.log('[READY] 事件接收 :', data);
        });
        short.on('ERROR', (data: any) => {
            console.log('[ERROR] 事件接收 :', data);
        });

        short.on('EVENT_SHORT', (data: any) => {
            console.log('【EVENT_SHORT】内部事件通知', data);
        });

        for (const event of Object.keys(eventMap)) {
            localRequire(`./${event}`)();
        }
    }

    async onTrigger(event: any): Promise<any> {
        this.createAndBindClient();
        this.registerListeners();
        const { short } = global as any;
        return short.callback(event);
    }

}
