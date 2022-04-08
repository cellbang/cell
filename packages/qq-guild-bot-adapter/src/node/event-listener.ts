import { Component } from '@malagu/core';
import { FaaSEventListener } from '@malagu/faas-adapter';
import { join } from 'path';
import { createOpenAPI, createWebsocket, createShort } from 'qq-guild-bot';
// eslint-disable-next-line no-eval
const localRequire = eval('require');
const { appID, token, intents, eventMap } = localRequire(join(__dirname, 'bot-config.json'));

@Component(FaaSEventListener)
export class BotEventListener implements FaaSEventListener<any, any> {

    protected clear() {
        try {
            (global as any).ws?.disconnect();
        } catch (error) {
            // NoOp
        }
    }

    protected getConfig() {
        return {
            appID,
            token,
            intents
        };
    }

    protected createAndBindClient() {
        const config = this.getConfig();
        const client = createOpenAPI(config);
        const ws = createWebsocket(config);

        (global as any).client = client;
        (global as any).ws = ws;
    }

    protected registerListeners() {
        const { ws } = global as any;

        ws.on('READY', (data: any) => {
            console.log('[READY] 事件接收 :', data);
        });
        ws.on('ERROR', (data: any) => {
            console.log('[ERROR] 事件接收 :', data);
        });

        for (const event of Object.keys(eventMap)) {
            localRequire(`./${event}`);
        }
    }

    protected waitShort(event: any) {
        const short = createShort(this.getConfig() as any);
        short.on('EVENT_SHORT', data => console.log('【EVENT_SHORT】内部事件通知', data));

        return short.callback(event);
    }

    async onTrigger(event: any): Promise<any> {
        this.clear();
        this.createAndBindClient();
        this.registerListeners();
        return this.waitShort(event);
    }

}
