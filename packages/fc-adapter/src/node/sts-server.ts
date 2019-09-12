import { Config } from '@webserverless/fc-browser-sdk/lib/browser';
import * as Client from '@alicloud/pop-core';
import { inject, injectable } from 'inversify';
import { Context } from '@malagu/core/lib/node';
import { ConfigProvider } from '@malagu/core/lib/common/config-provider';
import { STSServer } from '../common/sts-protocol';
import { AbstractContext } from './context';

@injectable()
export class STSServerImpl implements STSServer {

    @inject(ConfigProvider)
    protected readonly configProvider: ConfigProvider;
    async getConfig(roleArn?: string, roleSessionName?: string): Promise<Config> {
        const ctx = Context.getCurrent<AbstractContext>().context;
        const accountId = ctx.accountId;
        if (roleArn) {
            const client = new Client({
                accessKeyId: await this.configProvider.get<string>('accessKeyId'),
                accessKeySecret: await this.configProvider.get<string>('accessKeySecret'),
                endpoint: 'https://sts.aliyuncs.com',
                apiVersion: '2015-04-01'
            });
            const result: any = await client.request('AssumeRole', { RoleArn: roleArn, RoleSessionName: roleSessionName });
            return { ...result.Credentials, accountId };
        } else {
            return { ...ctx.credentials, accountId };
        }
    }
}
