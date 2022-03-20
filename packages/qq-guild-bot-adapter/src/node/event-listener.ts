import { Component } from '@malagu/core';
import { FaaSEventListener } from '@malagu/faas-adapter';
import { join } from 'path';
import { createOpenAPI, createWebsocket } from 'qq-guild-bot';
// eslint-disable-next-line no-eval
const localRequire = eval('require');
const { appID, token, intents, eventMap } = localRequire(join(process.cwd(), 'bot-config.json'));

@Component(FaaSEventListener)
export class BotEventListener implements FaaSEventListener<{}> {

    protected clear() {
        try {
            (global as any).ws?.disconnect();
        } catch (error) {
            // NoOp
        }
    }

    protected createAndBindClient() {
        const config = {
            appID,
            token,
            intents
        };
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

    async onTrigger(event: {}): Promise<void> {
        this.clear();
        this.createAndBindClient();
        this.registerListeners();
    }

}
