import { Credentials, Account } from '@malagu/cloud-plugin';
import FC20230330, * as $fc from '@alicloud/fc20230330';
import * as openapi from '@alicloud/openapi-client';
import * as chalk from 'chalk';
import { IFcToken } from '@serverless-cd/srm-aliyun-fc-domain/dist/impl/interface';
const FCClient = require('@alicloud/fc2');

export type AutoDomainParams = Omit<IFcToken, 'service'>;

// TODO `methods`为`undefined`
export async function getCustomDomain(client: FC20230330, customDomainName: string, print = false, qualifier?: string, params?: AutoDomainParams) {
    try {
        if (customDomainName === 'auto') {
            customDomainName = parseDomain(params!);
        }
        const result = await client.getCustomDomain(customDomainName);
        if (print) {
            console.log(chalk`{bold.cyan - CustomDomain: }`);
            console.log(`    - DomainName: ${result.body.domainName}`);
            console.log(`    - Protocol: ${result.body.protocol}`);
            console.log(`    - LastModifiedTime: ${result.body.lastModifiedTime}`);
            const routeConfig = result.body.routeConfig;
            let path = '';
            if (routeConfig?.routes?.length) {
                console.log('    - RouteConfig: ');
                for (const route of routeConfig.routes) {
                    console.log(`        - Path: ${route.path}`);
                    console.log(`          Methods: ${route.methods}`);

                    if (route.qualifier === qualifier) {
                        path = route.path?.split('*')[0] || '';
                    }
                }
            }
            console.log(`    - ApiUrl: ${result.body.protocol?.includes('HTTPS') ? 'https' : 'http'}://${customDomainName}${path}`);
        }
        return result;
    } catch (ex) {
        if (ex.code !== 'DomainNameNotFound') {
            throw ex;
        }
    }
}

export async function getAlias(client: FC20230330, aliasName: string, functionName: string, print = false) {

    try {
        const result = await client.getAlias(functionName, aliasName);
        if (print) {
            console.log(chalk`{bold.cyan - Alias: }`);
            console.log(`    - AliasName: ${result.body.aliasName}`);
            console.log(`    - functionName: ${functionName}`);
            console.log(`    - VersionId: ${result.body.versionId}`);
            console.log(`    - LastModifiedTime: ${result.body.lastModifiedTime}`);
        }
        return result;
    } catch (ex) {
        if (ex.code !== 'AliasNotFound') {
            throw ex;
        }
    }
}

export async function getLayer(client: FC20230330, prefix?: string, print = false) {
    if (!prefix) {
        return;
    }
    const result = await client.listLayers(new $fc.ListLayersRequest({ prefix, limit: 1 }));
    const layer = result.body.layers?.[0];
    if (layer && print) {
        console.log(chalk`{bold.cyan - Layer: }`);
        console.log(`    - LayerName: ${layer.layerName}`);
        console.log(`    - Version: ${layer.version}`);
        console.log(`    - Description: ${layer.description}`);
        console.log(`    - CompatibleRuntime: ${layer.compatibleRuntime}`);
        console.log(`    - Arn: ${layer.layerVersionArn}`);
        console.log(`    - CreateTime: ${layer.createTime}`);
    }
    return layer;
}

export async function getFunction(client: FC20230330, functionName: string, print = false): Promise<$fc.Function | undefined> {
    try {
        const result = await client.getFunction(functionName, new $fc.GetFunctionRequest({}));
        if (print) {
            console.log(chalk`{bold.cyan - Function: }`);
            console.log(`    - FunctionName: ${result.body.functionName}`);
            console.log(`    - Cpu: ${result.body.cpu}`);
            console.log(`    - MemorySize: ${result.body.memorySize}`);
            console.log(`    - DiskSize: ${result.body.diskSize}`);
            console.log(`    - Runtime: ${result.body.runtime}`);
            console.log(`    - Timeout: ${result.body.timeout}`);
            console.log(`    - Concurrency: ${result.body.instanceConcurrency}`);
            console.log(`    - CAPort: ${result.body.caPort}`);
            console.log(`    - LastModifiedTime: ${result.body.lastModifiedTime}`);
        }
        return result.body;

    } catch (ex) {
        if (ex.code !== 'FunctionNotFound') {
            throw ex;
        }
    }
}

export async function getTrigger(client: FC20230330, functionName: string, triggerName: string, region?: string, accountId?: string, print = false) {

    try {
        const result = await client.getTrigger(functionName, triggerName);
        if (print) {
            console.log(chalk`{bold.cyan - Trigger: }`);
            console.log(`    - TriggerName: ${result.body.triggerName}`);
            console.log(`    - TriggerType: ${result.body.triggerType}`);
            console.log(`    - Qualifier: ${result.body.qualifier}`);
            console.log(`    - InvocationRole: ${result.body.invocationRole}`);
            console.log(`    - SourceArn: ${result.body.sourceArn}`);
            console.log(`    - LastModifiedTime: ${result.body.lastModifiedTime}`);
            let triggerConfig: Record<string, any> = {};
            try {
                if (result.body.triggerConfig) {
                    triggerConfig = JSON.parse(result.body.triggerConfig);
                }
            } catch (_) {}
            if (result.body.triggerType === 'http') {
                console.log(`    - Methods: ${triggerConfig.methods}`);
                if (region && accountId) {
                    console.log(`    - Url[Internet]: ${result.body.httpTrigger?.urlInternet}`);
                }
            } else if (result.body.triggerType === 'timer') {
                console.log(`    - Cron: ${triggerConfig.cronExpression}`);
                console.log(`    - Enable: ${triggerConfig.enable}`);
            }
        }
        return result.body;

    } catch (ex) {
        if (ex.code !== 'TriggerNotFound') {
            throw ex;
        }
    }

}

export async function createFcClient(cloudConfig: any, region: string, credentials: Credentials, account: Account) {
    const fcClient = new FC20230330(new openapi.Config({
        accessKeyId: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        securityToken: credentials.token,
        regionId: region,
        timeout: cloudConfig.timeout,
        endpoint: `${account.id}.cn-zhangjiakou.fc.aliyuncs.com`
    }));

    return fcClient;
}

export async function createFc2Client(cloudConfig: any, region: string, credentials: Credentials, account: Account) {
    const fcClient = new FCClient(account.id, {
        accessKeyID: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        securityToken: credentials.token,
        region,
        timeout: cloudConfig.timeout,
        secure: cloudConfig.secure,
        internal: cloudConfig.internal
    });

    return fcClient;
}

export function parseDomain(params: AutoDomainParams) {
    return `${params.function}.fcv3.${params.user}.${params.region}.fc.devsapp.net`.toLocaleLowerCase();
}
