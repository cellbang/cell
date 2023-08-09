import { Credentials, Account } from '@malagu/cloud-plugin';
import { Params } from './api';
const chalk = require('chalk');
const FCClient = require('@alicloud/fc2');
const CloudAPI = require('@alicloud/cloudapi');
const Ram = require('@alicloud/ram');

export async function getCustomDomain(client: any, customDomainName: string, print = false, qualifier?: string, params?: Params) {
    try {
        if (customDomainName === 'auto') {
            customDomainName = parseDomain(params!);
        }
        const result = await client.getCustomDomain(customDomainName);
        if (print) {
            console.log(chalk`{bold.cyan - CustomDomain: }`);
            console.log(`    - DomainName: ${result.data.domainName}`);
            console.log(`    - Protocol: ${result.data.protocol}`);
            console.log(`    - LastModifiedTime: ${result.data.lastModifiedTime}`);
            const routeConfig = result.data.routeConfig;
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
            console.log(`    - ApiUrl: ${result.data.protocol.includes('HTTPS') ? 'https' : 'http'}://${customDomainName}${path}`);
        }
        return result;
    } catch (ex) {
        if (ex.code !== 'DomainNameNotFound') {
            throw ex;
        }
    }
}

export async function getAlias(client: any, aliasName: string, serviceName: string, print = false) {

    try {
        const result = await client.getAlias(serviceName, aliasName);
        if (print) {
            console.log(chalk`{bold.cyan - Alias: }`);
            console.log(`    - AliasName: ${result.data.aliasName}`);
            console.log(`    - serviceName: ${serviceName}`);
            console.log(`    - VersionId: ${result.data.versionId}`);
        }
        return result;
    } catch (ex) {
        if (ex.code !== 'AliasNotFound') {
            throw ex;
        }
    }
}

export async function getLayer(client: any, prefix?: string, print = false) {
    if (!prefix) {
        return;
    }
    const result = await client.listLayers({ prefix, startKey: prefix, limit: 1 });
    const layer = result.data.layers[0];
    if (layer && print) {
        console.log(chalk`{bold.cyan - Layer: }`);
        console.log(`    - LayerName: ${layer.layerName}`);
        console.log(`    - Version: ${layer.version}`);
        console.log(`    - Description: ${layer.description}`);
        console.log(`    - CompatibleRuntime: ${layer.compatibleRuntime}`);
        console.log(`    - Arn: ${layer.arn}`);
        console.log(`    - CreateTime: ${layer.createTime}`);
    }
    return layer;
}

export async function getFunction(client: any, serviceName: string, functionName: string, print = false) {
    try {
        const result = await client.getFunction(serviceName, functionName);
        if (print) {
            console.log(chalk`{bold.cyan - Function: }`);
            console.log(`    - FunctionName: ${result.data.functionName}`);
            console.log(`    - Timeout: ${result.data.timeout}`);
            console.log(`    - MemorySize: ${result.data.memorySize}`);
            console.log(`    - Runtime: ${result.data.runtime}`);
            console.log(`    - CAPort: ${result.data.caPort}`);
            console.log(`    - LastModifiedTime: ${result.data.lastModifiedTime}`);
        }
        return result;

    } catch (ex) {
        if (ex.code !== 'FunctionNotFound') {
            throw ex;
        }
    }
}

export async function getService(client: any, serviceName: string, qualifier?: string, print = false) {
    try {
        const result = await client.getService(serviceName, qualifier);
        if (print) {
            console.log(chalk`{bold.cyan - Service: }`);
            console.log(`    - ServiceName: ${result.data.serviceName}`);
            console.log(`    - Role: ${result.data.role}`);
            console.log(`    - LastModifiedTime: ${result.data.lastModifiedTime}`);

            const logConfig = result.data.logConfig;
            if (logConfig?.project && logConfig?.logstore) {
                console.log('    - LogConfig: ');
                console.log(`        - Project: ${logConfig.project}`);
                console.log(`        - Logstore: ${logConfig.logstore}`);
                console.log(`        - EnableRequestMetrics: ${logConfig.enableRequestMetrics}`);
                console.log(`        - LogBeginRule: ${logConfig.logBeginRule}`);
            }

            const nasConfig = result.data.nasConfig;
            if (nasConfig?.groupId !== -1 && nasConfig?.userId !== -1) {
                console.log('    - NASConfig: ');
                console.log(`        - GroupId: ${nasConfig.groupId}`);
                console.log(`        - UserId: ${nasConfig.userId}`);
                if (nasConfig.mountPoints?.length > 0) {
                    console.log('        - MountPoints: ');
                    for (const mountpoint of nasConfig.mountPoints) {
                        console.log(`            - MountDir: ${mountpoint.mountDir}`);
                        console.log(`              ServerAddr: ${mountpoint.serverAddr}`);
                    }
                }
            }

            const vpcConfig = result.data.vpcConfig;
            if (vpcConfig?.securityGroupId && vpcConfig?.vpcId) {
                console.log('    - VpcConfig: ');
                console.log(`        - VpcId: ${vpcConfig.vpcId}`);
                console.log(`        - SecurityGroupId: ${vpcConfig.securityGroupId}`);
                if (vpcConfig.vSwitchIds?.length > 0) {
                    console.log(`        - VSwitchIds: ${vpcConfig.vSwitchIds}`);
                }
            }

            const tracingConfig = result.data.tracingConfig;
            if (tracingConfig?.type) {
                console.log('    - TracingConfig: ');
                console.log(`        - Type: ${logConfig.type}`);
            }
        }
        return result;
    } catch (ex) {
        if (ex.code !== 'ServiceNotFound') {
            throw ex;
        }
    }
}

export async function getApi(client: any, groupId: string, apiName: string, print = false, subDomain?: string, path?: string, protocol?: string) {
    let result = await client.describeApis({
        ApiName: apiName,
        GroupId: groupId,
        PageSize: 100
    }, { timeout: 60000 });
    const apis = result.ApiSummarys ? result.ApiSummarys.ApiSummary.filter((item: any) => item.ApiName === apiName) : [];
    if (apis.length > 1) {
        throw new Error(`There are two or more apis named [${apiName}] in the api gateway`);
    } else if (apis.length === 1) {
        result = apis[0];
        if (print) {
            console.log(chalk`{bold.cyan - API: }`);
            console.log(`    - ApiId: ${result.ApiId}`);
            console.log(`    - ApiName: ${result.ApiName}`);
            console.log(`    - Visibility: ${result.Visibility}`);
            console.log(`    - ModifiedTime: ${result.ModifyTime}`);
            if (subDomain && path && protocol) {
                console.log(`    - ApiUrl: ${protocol.includes('HTTPS') ? 'https' : 'http'}://${subDomain!}${path.split('*')[0]}`);
            }
        }
        return result;
    }
}

export async function getGroup(client: any, groupName: string, print = false) {
    const res = await client.describeApiGroups({
        GroupName: groupName // filter out
    }, { timeout: 60000 });

    const groups = res.ApiGroupAttributes ? res.ApiGroupAttributes.ApiGroupAttribute : [];
    const list = groups.filter((item: any) => item.GroupName === groupName);
    if (list.length > 1) {
        throw new Error(`There are two or more groups named [${groupName}] in the api gateway`);
    } else if (list.length === 1) {
        const result = list[0];
        if (print) {
            console.log(chalk`{bold.cyan - Group: }`);
            console.log(`    - GroupId: ${result.GroupId}`);
            console.log(`    - GroupName: ${result.GroupName}`);
            console.log(`    - ModifiedTime: ${result.ModifiedTime}`);
            console.log(`    - SubDomain: ${result.SubDomain}`);
            console.log(`    - IllegalStatus: ${result.IllegalStatus}`);
            console.log(`    - BillingStatus: ${result.BillingStatus}`);
            console.log(`    - InstanceType: ${result.InstanceType}`);

        }
        return result;
    }
}

export async function getTrigger(client: any, serviceName: string, functionName: string, triggerName: string, region?: string, accountId?: string, print = false) {

    try {
        const result = await client.getTrigger(serviceName, functionName, triggerName);
        if (print) {
            console.log(chalk`{bold.cyan - Trigger: }`);
            console.log(`    - TriggerName: ${result.data.triggerName}`);
            console.log(`    - TriggerType: ${result.data.triggerType}`);
            console.log(`    - Qualifier: ${result.data.qualifier}`);
            console.log(`    - InvocationRole: ${result.data.invocationRole}`);
            console.log(`    - SourceArn: ${result.data.sourceArn}`);
            console.log(`    - LastModifiedTime: ${result.data.lastModifiedTime}`);
            if (result.data.triggerType === 'http') {
                console.log(`    - Methods: ${result.data.triggerConfig.methods}`);
                if (region && accountId) {
                    console.log(`    - ApiUrl: https://${accountId}.${region}.fc.aliyuncs.com/2016-08-15/proxy/${serviceName}.${result.data.qualifier}/${functionName}/`);
                }
            } else if (result.data.triggerType === 'timer') {
                console.log(`    - Cron: ${result.data.triggerConfig.cronExpression}`);
                console.log(`    - Enable: ${result.data.triggerConfig.enable}`);
            }
        }
        return result;

    } catch (ex) {
        if (ex.code !== 'TriggerNotFound') {
            throw ex;
        }
    }

}

export async function createClients(cloudConfig: any, region: string, credentials: Credentials, account: Account) {
    const fcClient = new FCClient(account.id, {
        accessKeyID: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        securityToken: credentials.token,
        region,
        timeout: cloudConfig.timeout,
        secure: cloudConfig.secure,
        internal: cloudConfig.internal
    });

    const apiClient = new CloudAPI({
        accessKeyId: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        endpoint: `http://apigateway.${region}.aliyuncs.com`,
    });

    const ram = new Ram({
        accessKeyId: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        endpoint: 'https://ram.aliyuncs.com'
    });
    return { fcClient, apiClient, ram };
}

export function parseDomain(params: Params) {
    return `${params.function}.${params.service}.${params.user}.${params.region}.fc.devsapp.net`.toLocaleLowerCase();
}
