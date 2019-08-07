import { Config } from '@webserverless/fc-browser-sdk/lib/browser';

export const stsPath = '/services/sts';

export const STSServer = Symbol('STSServer');

export interface STSServer {
    getConfig(roleArn?: string, roleSessionName?: string): Promise<Config>
}
