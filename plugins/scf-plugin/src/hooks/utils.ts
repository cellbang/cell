import { Credentials } from '@malagu/cloud-plugin';
import { scf, apigateway } from 'tencentcloud-sdk-nodejs';
const chalk = require('chalk');
import * as delay from 'delay';

const ScfClient = scf.v20180416.Client;
const ApiClient = apigateway.v20180808.Client;

export async function getUsagePlan(client: any, usagePlanName: string, print = false) {
    const describeUsagePlansStatusRequest: any = {};
    const filter: any = {};
    filter.Name = 'UsagePlanName';
    filter.Values = [usagePlanName];
    describeUsagePlansStatusRequest.Filters = [filter];
    describeUsagePlansStatusRequest.Limit = 100;
    const describeUsagePlansStatusResponse = await client.DescribeUsagePlansStatus(describeUsagePlansStatusRequest);
    const usagePlanStatusSet = describeUsagePlansStatusResponse.Result?.UsagePlanStatusSet.filter((item: any) => item.UsagePlanName === usagePlanName);
    if (usagePlanStatusSet?.length > 1) {
        throw new Error(`There are two or more usage plan named [${usagePlanName}] in the api gateway`);
    } else if (usagePlanStatusSet?.length === 1) {
        const result = usagePlanStatusSet[0];
        if (print) {
            console.log(chalk`{bold.cyan - UsagePlan: }`);
            console.log(`    - UsagePlanId: ${result.UsagePlanId}`);
            console.log(`    - UsagePlanName: ${result.UsagePlanName}`);
            console.log(`    - MaxRequestNum: ${result.MaxRequestNum}`);
        }
        return result;
    }
}

export async function getCustomDomain(client: any, serviceId: string, customDomainName: string, print = false, environmentName?: string) {
    const describeServiceSubDomainsRequest: any = {};
    describeServiceSubDomainsRequest.ServiceId = serviceId;
    const describeApisStatusResponse = await client.DescribeServiceSubDomains(describeServiceSubDomainsRequest);
    const result = describeApisStatusResponse.Result?.DomainSet?.find((d: any) => d.DomainName === customDomainName);
    if (result) {
        if (print) {
            console.log(chalk`{bold.cyan - CustomDomain: }`);
            console.log(`    - DomainName: ${result.DomainName}`);
            console.log(`    - Status: ${result.Status}`);
            console.log(`    - CertificateId: ${result.CertificateId}`);
            console.log(`    - Protocol: ${result.Protocol}`);
            console.log(`    - IsDefaultMapping: ${result.IsDefaultMapping}`);
            if (environmentName) {
                const mappings = await client.DescribeServiceSubDomainMappings({ ServiceId: serviceId, SubDomain: customDomainName });
                let path = '';
                for (const mapping of mappings.Result?.PathMappingSet || []) {
                    if (mapping.Environment === environmentName) {
                        path = mapping.Path?.split('*')[0];
                    }
                }
                console.log(`    - Url: ${result.Protocol.includes('https') ? 'https' : 'http'}://${result.DomainName}${path}`);
            }
        }
        return result;
    }
}

export async function getTrigger(client: any, namespaceName: string, functionName: string, triggerName?: string, aliasName?: string, print = false) {
    const listTriggersRequest: any = {};
    listTriggersRequest.FunctionName = functionName;
    listTriggersRequest.Namespace = namespaceName;
    listTriggersRequest.Limit = 100;
    const triggers = (await client.ListTriggers(listTriggersRequest)).Triggers || [];
    for (const trigger of triggers) {
        if (aliasName && trigger.Qualifier === aliasName || triggerName && triggerName === triggerName) {
            const result = trigger;
            if (print) {
                console.log(chalk`{bold.cyan - Trigger: }`);
                console.log(`    - TriggerName: ${result.TriggerName}`);
                console.log(`    - Type: ${result.Type}`);
                console.log(`    - Enable: ${result.Enable}`);
                console.log(`    - AvailableStatus: ${result.AvailableStatus}`);
            }
            return result;
        }
    }
}

export async function getAlias(client: any, aliasName: string, namespaceName: string, functionName: string, functionVersion?: string, print = false) {
    const getAliasRequest: any = {};
    getAliasRequest.Name = aliasName;
    getAliasRequest.FunctionName = functionName;
    getAliasRequest.Namespace = namespaceName;
    try {
        await checkStatus(client, namespaceName, functionName, functionVersion);
        const result = await client.GetAlias(getAliasRequest);
        if (print) {
            console.log(chalk`{bold.cyan - Alias: }`);
            console.log(`    - Name: ${result.Name}`);
            console.log(`    - FunctionVersion: ${result.FunctionVersion}`);
        }
        return result;
    } catch (error) {
        if (error.code !== 'ResourceNotFound.Alias') {
            throw error;
        }
    }
}

export async function checkStatus(client: any, namespace: string, functionName: string, qualifier?: string) {
    let status = 'Updating';
    let times = 200;
    while ((status !== 'Active') && times > 0) {
        const tempFunc = await doGetFunction(client, namespace, functionName, qualifier);
        status = tempFunc.Status;
        await delay(200);
        times = times - 1;
    }
    if (status !== 'Active') {
        throw new Error(`Please check function status: ${functionName}`);
    }
}

function doGetFunction(client: any, namespace: string, functionName: string, qualifier?: string) {
    const getFunctionRequest: any = {};
    getFunctionRequest.FunctionName = functionName;
    getFunctionRequest.Namespace = namespace;
    if (qualifier) {
        getFunctionRequest.Qualifier = qualifier;
    }
    return client.GetFunction(getFunctionRequest);
}


export async function getFunction(client: any, namespaceName: string, functionName: string, print = false) {

    try {
        const result = await doGetFunction(client, namespaceName, functionName);
        if (print) {
            console.log(chalk`{bold.cyan - Function: }`);
            console.log(`    - FunctionName: ${result.FunctionName}`);
            console.log(`    - FunctionType: ${result.Type}`);
            console.log(`    - MemorySize: ${result.MemorySize}`);
            console.log(`    - Role: ${result.Role}`);
            console.log(`    - Status: ${result.Status}`);
            console.log(`    - StatusDesc: ${result.StatusDesc}`);
            console.log(`    - AvailableStatus: ${result.AvailableStatus}`);
            console.log(`    - Runtime: ${result.Runtime}`);
            console.log(`    - Timeout: ${result.Timeout}`);
            console.log(`    - ClsLogsetId: ${result.ClsLogsetId}`);
            console.log(`    - ClsTopicId: ${result.ClsTopicId}`);
            console.log(`    - L5Enable: ${result.L5Enable}`);
            console.log(`    - OnsEnable: ${result.OnsEnable}`);
            console.log(`    - TraceEnable: ${result.TraceEnable}`);
            console.log(`    - UseGpu: ${result.UseGpu}`);
            console.log(`    - PublicNetStatus: ${result.PublicNetConfig?.PublicNetStatus}`);
            console.log(`    - ModTime: ${result.ModTime}`);

            const vpcConfig = result.VpcConfig;
            if (vpcConfig?.SubnetId) {
                console.log('    - VpcConfig:');
                console.log(`        - VpcId: ${vpcConfig.VpcId}`);
                console.log(`        - SubnetId: ${vpcConfig.SubnetId}`);
            }

            const deadLetterConfig = result.DeadLetterConfig;
            if (deadLetterConfig?.Name) {
                console.log('    - DeadLetterConfig:');
                console.log(`        - Name: ${deadLetterConfig.Name}`);
                console.log(`        - Type: ${deadLetterConfig.Type}`);
                console.log(`        - FilterType: ${deadLetterConfig.FilterType}`);
            }

            const eipConfig = result.EipConfig;
            if (eipConfig?.EipFixed) {
                console.log('    - EIPConfig:');
                console.log(`        - EipFixed: ${eipConfig.EipFixed}`);
                console.log(`        - Eips: ${eipConfig.Eips}`);
            }

            const cfsConfig = result.CfsConfig;
            if (cfsConfig?.CfsInsList?.length) {
                console.log('    - CfsConfig:');
                for (const config of cfsConfig.CfsInsList) {
                    console.log(`        - CfsId: ${config.CfsId}`);
                    console.log(`          LocalMountDir: ${config.LocalMountDir}`);
                    console.log(`          RemoteMountDir: ${config.RemoteMountDir}`);
                    console.log(`          UserId: ${config.UserId}`);
                    console.log(`          UserGroupId: ${config.UserGroupId}`);
                    console.log(`          IpAddress: ${config.IpAddress}`);
                }
            }

        }
        return result;
    } catch (error) {
        if (error.code !== 'ResourceNotFound.Function') {
            throw error;
        }
    }

}

export async function getNamespace(client: any, namespaceName: string, print = false) {
    const listNamespacesRequest: any = {};
    listNamespacesRequest.Limit = 100;
    const listNamespacesResponse = await client.ListNamespaces(listNamespacesRequest);
    const result = listNamespacesResponse.Namespaces.find((n: any) => n.Name === namespaceName);
    if (result) {
        if (print) {
            console.log(chalk`{bold.cyan - Namespace: }`);
            console.log(`    - NamespaceName: ${result.Name}`);
            console.log(`    - NamespaceType: ${result.Type}`);
        }
        return result;
    }
}


export async function getService(client: any, serviceName: string, print = false) {
    const describeServicesStatusRequest: any = {};
    const filter: any = {};
    filter.Name = 'ServiceName';
    filter.Values = [serviceName];
    describeServicesStatusRequest.Filters = [filter];
    describeServicesStatusRequest.Limit = 100;
    const describeServicesStatusResponse = await client.DescribeServicesStatus(describeServicesStatusRequest);
    const serviceSet = describeServicesStatusResponse.Result.ServiceSet.filter((item: any) => item.ServiceName === serviceName);
    if (serviceSet.length > 1) {
        throw new Error(`There are two or more services named [${serviceName}] in the api gateway`);
    } else if (serviceSet.length === 1) {
        const result = serviceSet[0];
        if (print) {
            console.log(chalk`{bold.cyan - Service: }`);
            console.log(`    - ServiceId: ${result.ServiceId}`);
            console.log(`    - ServiceName: ${result.ServiceName}`);
            console.log(`    - OuterSubDomain: ${result.OuterSubDomain}`);
            console.log(`    - InnerSubDomain: ${result.InnerSubDomain}`);
            console.log(`    - Protocol: ${result.Protocol}`);
        }
        return result;
    }
}

export async function getApi(client: any, serviceId: string, apiName: string, print = false, subDomain?: string, serviceProtocol?: string, environmentName?: string) {
    const describeApisStatusRequest: any = {};
    const filter: any = {};
    filter.Name = 'ApiName';
    filter.Values = [ apiName ];
    describeApisStatusRequest.Filters = [filter];
    describeApisStatusRequest.ServiceId = serviceId;
    describeApisStatusRequest.Limit = 100;
    const describeApisStatusResponse = await client.DescribeApisStatus(describeApisStatusRequest);
    const apiIdStatusSet = describeApisStatusResponse.Result?.ApiIdStatusSet.filter((item: any) => item.ApiName === apiName);
    if (apiIdStatusSet && apiIdStatusSet.length === 1) {
        const result = apiIdStatusSet[0];
        if (print) {
            console.log(chalk`{bold.cyan - API: }`);
            console.log(`    - ApiId: ${result.ApiId}`);
            console.log(`    - ApiName: ${result.ApiName}`);
            console.log(`    - Protocol: ${result.Protocol}`);
            if (subDomain && serviceProtocol) {
                const path = result.Path?.split('*')[0];
                const protocol = serviceProtocol.includes('https') ? 'https' : 'http';
                console.log(`    - ApiUrl: ${protocol}://${subDomain!}${environmentName === 'release' ? '' : `/${environmentName}`}${path}`);
            }
        }
        return result;
    } else if (apiIdStatusSet.length > 1) {
        throw new Error(`There are two or more apis named [${apiName}] in the api gateway`);
    }
}

export async function createClients(region: string, credentials: Credentials) {
    const clientConfig: any = {
        credential: {
            secretId: credentials.accessKeyId,
            secretKey: credentials.accessKeySecret,
            token: credentials.token
        },
        profile: {
            signMethod: 'HmacSHA256',
            httpProfile: {
                reqMethod: 'POST',
                reqTimeout: 30,
            },
        },
        region: region
    };
    return {
        scfClient: new ScfClient(clientConfig),
        apiClient: new ApiClient(clientConfig),
        scfClientExt: new ScfClient({ ...clientConfig,
            profile: {
               signMethod: 'TC3-HMAC-SHA256',
               httpProfile: {
                   reqMethod: 'POST',
                   reqTimeout: 30
                }
            }})
    }
}
