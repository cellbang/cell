import { Client as InnerClient } from '@webserverless/fc-browser-sdk/lib/browser/client';
import { injectable, } from 'inversify';
import { STSServer } from '../common/sts-protocol';
import { HttpProxyCreator } from '@malagu/core/lib/browser';
import { HttpChannel } from '@malagu/core/lib/common/jsonrpc/http-channel';
import { Channel } from '@malagu/core/lib/common/jsonrpc/channel-protocol';

export interface ServicePath {
    service: string
    function: string
    path: string
}

@injectable()
export class FCProxyCreator extends HttpProxyCreator {

    protected client: InnerClient;
    stsServer: STSServer;

    protected createChannel(id: number, path: string): Channel {
        const channel = new HttpChannel(id, async content => {
            const client = await this.getOrCreateClient();
            const servicePath = await this.parse(path);
            const result = await client.invokeFunction(servicePath.service, servicePath.function, content);
            channel.handleMessage(JSON.parse(result.data));
        }, path);
        return channel;
    }

    support(path: string): number {
        return path.startsWith('fc:') ? 600 : 0;
    }

    protected async createClient() {
        const config = await this.stsServer.getConfig();
        this.client = new InnerClient(config);
        return this.client;
    }

    protected getOrCreateClient() {
        if (this.client) {
            return Promise.resolve(this.client);
        }
        setInterval(() => {
            this.createClient();
        }, 180000);
        return this.createClient();
    }

    protected async parse(path: string): Promise<ServicePath> {
        const parts = path.split(':');
        parts.pop();
        if (parts.length = 3) {
            return {
                service: parts[0],
                function: parts[1],
                path: parts[2]
            };
        }
        throw new Error(`Path format is incorrect: ${path}`);
    }
}
