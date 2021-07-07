import { DeployContext } from '@malagu/cli-service';
import * as JSZip from 'jszip';
import * as ora from 'ora';
import * as traverse from 'traverse';
import * as delay from 'delay';
import { DefaultCodeLoader, FaaSAdapterUtils, DefaultProfileProvider } from '@malagu/faas-adapter/lib/hooks';

import { scf, apigateway } from 'tencentcloud-sdk-nodejs';
const chalk = require('chalk');

const ScfClient = scf.v20180416.Client;
const ApiClient = apigateway.v20180808.Client;

let clientConfig: any;

export default async (context: DeployContext) => {
    const { cfg, pkg } = context;

    const adapterConfig = FaaSAdapterUtils.getConfiguration<any>(cfg);

    const profileProvider = new DefaultProfileProvider();
    const { region, credentials } = await profileProvider.provide(adapterConfig);
    clientConfig = {
        credential: {
            secretId: credentials.accessKeyId,
            secretKey: credentials.accessKeySecret,
        },
        profile: {
            signMethod: 'HmacSHA256',
            httpProfile: {
                reqMethod: 'POST',
                reqTimeout: 30,
            },
        },
        region: region,
    };
    const { namespace, apiGateway, customDomain, alias, trigger } = adapterConfig;
    const functionMeta = adapterConfig.function;
    const functionName = functionMeta.name;

    console.log(`\nDeploying ${chalk.bold.yellow(pkg.pkg.name)} to the ${chalk.bold.blue(region)} region of SCF...`);
    console.log(chalk`{bold.cyan - SCF:}`);

    await createOrUpdateNamespace(namespace);

    const codeLoader = new DefaultCodeLoader();
    const zip = await codeLoader.load(context, adapterConfig);
    await createOrUpdateFunction(functionMeta, zip);

    const functionVersion = await publishVersion(namespace.name, functionName);

    await createOrUpdateAlias(alias, functionVersion);

    if (trigger) {
        await createTrigger(trigger);
    }

    if (apiGateway) {
        console.log(chalk`\n{bold.cyan - API Gateway:}`);
        const { usagePlan, strategy, api, service, release } = apiGateway;
        const { serviceId, subDomain } = await createOrUpdateService(service);
        const apiId = await createOrUpdateApi(serviceId, subDomain, service.protocol, release.environmentName, api);
        if (customDomain.name) {
            await bindOrUpdateCustomDomain(serviceId, customDomain, subDomain);
        }

        if (usagePlan.maxRequestNum !== undefined || usagePlan.maxRequestNumPreSec !== undefined) {
            createOrUpdateUsagePlan(usagePlan, api, apiId, serviceId);
        }

        if (strategy.strategy !== undefined) {
            updateApiEnvironmentStrategy(serviceId, apiId, api, strategy);
        }

        await releaseService(serviceId, release);

    }
    console.log('Deploy finished');
    console.log();
};

function getScfClient() {
    return new ScfClient(clientConfig);
}

function getApiClient() {
    return new ApiClient(clientConfig);
}

function getScfClientExt() {
   return new ScfClient({ ...clientConfig,
    profile: {
       signMethod: 'TC3-HMAC-SHA256',
       httpProfile: {
           reqMethod: 'POST',
           reqTimeout: 30
        }
    }});
}

function cleanObj(obj: any) {
    traverse(obj).forEach(function (value: any) {
        if (value === undefined) {
            // eslint-disable-next-line no-null/no-null
            this.update(null);
        }
    });
}

async function createTrigger(trigger: any) {
    const scfClient = getScfClient();

    const listTriggerRequest: any = {};
    listTriggerRequest.Namespace = trigger.namespace;
    listTriggerRequest.FunctionName = trigger.functionName;
    listTriggerRequest.Limit = 100;
    const listTriggersResponse = await scfClient.ListTriggers(listTriggerRequest);
    if (listTriggersResponse.Triggers?.some((t: any) => t.TriggerName === trigger.name)) {
        const deleteTriggerRequest: any = {};
        deleteTriggerRequest.Namespace = trigger.namespace;
        deleteTriggerRequest.FunctionName = trigger.functionName;
        deleteTriggerRequest.Type = trigger.type;
        deleteTriggerRequest.TriggerName = trigger.name;
        deleteTriggerRequest.Qualifier = trigger.qualifier;
        if (trigger.type === 'cos') {
            deleteTriggerRequest.TriggerDesc = trigger.triggerDesc;
        }
        await scfClient.DeleteTrigger(deleteTriggerRequest);

    }
    const createTriggerRequest: any = {};
    createTriggerRequest.Namespace = trigger.namespace;
    createTriggerRequest.FunctionName = trigger.functionName;
    createTriggerRequest.Qualifier = trigger.qualifier;
    createTriggerRequest.TriggerName = trigger.name;
    createTriggerRequest.Type = trigger.type;
    createTriggerRequest.Enable = trigger.enable;
    createTriggerRequest.TriggerDesc = trigger.triggerDesc;
    await spinner(`Set a ${trigger.name} Trigger`, async () => {
        await scfClient.CreateTrigger(createTriggerRequest);
    });
    console.log(`    - Type: ${trigger.type}`);
    console.log(`    - TriggerDesc: ${trigger.triggerDesc}`);
    console.log(`    - Enable: ${trigger.enable}`);
}

async function createOrUpdateNamespace(namespace: any) {
    const scfClient = getScfClient();
    const listNamespacesRequest: any = {};
    listNamespacesRequest.Limit = 100;
    const listNamespacesResponse = await scfClient.ListNamespaces(listNamespacesRequest);
    if (listNamespacesResponse.Namespaces.some((n: any) => n.Name === namespace.name)) {
        const updateNamespaceRequest: any = {};
        updateNamespaceRequest.Namespace = namespace.name;
        updateNamespaceRequest.Description = namespace.description;
        if (namespace.description) {
            await spinner(`Update ${namespace.name} namespace`, async () => {
                await scfClient.UpdateNamespace(updateNamespaceRequest);
            });
        } else {
            await spinner(`Skip ${namespace.name} namespace`, async () => { });
        }
    } else {
        await spinner(`Create a ${namespace.name} namespace`, async () => {
            const createNamespaceRequest: any = {};
            createNamespaceRequest.Namespace = namespace.name;
            createNamespaceRequest.Description = namespace.description;
            await scfClient.CreateNamespace(createNamespaceRequest);
        });
    }
}

async function parseFunctionMeta(req: any, functionMeta: any, code?: JSZip) {
    req.FunctionName = functionMeta.name;
    req.Description = functionMeta.description;
    req.MemorySize = functionMeta.memorySize;
    req.Timeout = functionMeta.timeout;
    req.Runtime = functionMeta.runtime;
    req.Namespace = functionMeta.namespace;
    req.Role = functionMeta.role;
    req.ClsLogsetId = functionMeta.clsLogsetId;
    req.ClsTopicId = functionMeta.ClsTopicId;

    const { env, vpcConfig, layers, deadLetterConfig, publicNetConfig } = functionMeta;
    if (env) {
        const variables: any[] = [];
        for (const key in env) {
            if (env.hasOwnProperty(key)) {
                const variable: any = {};
                variable.Key = key;
                variable.Value = env[key];
                variables.push(variable);
            }
        }
        const environment: any = {};
        environment.Variables = variables;
        req.Environment = environment;
    }

    if (vpcConfig) {
        req.VpcConfig = {} as any;
        req.VpcConfig.VpcId = vpcConfig.vpcId;
        req.VpcConfig.SubnetId = vpcConfig.subnetId;
    }

    if (layers) {
        req.Layers = [];
        for (const l of layers) {
            const layer: any = {};
            layer.LayerName = l.name;
            layer.LayerVersion = l.version;
            req.Layers.push(layer);
        }
    }

    if (deadLetterConfig) {
        req.DeadLetterConfig = {} as any;
        req.DeadLetterConfig.Type = deadLetterConfig.type;
        req.DeadLetterConfig.Name = deadLetterConfig.name;
        req.DeadLetterConfig.FilterType = deadLetterConfig.filterType;
    }

    if (publicNetConfig) {
        req.PublicNetConfig = {} as any;
        req.DeadLetterConfig.PublicNetStatus = publicNetConfig.PublicNetStatus;
        if (publicNetConfig.eipConfig) {
            req.PublicNetConfig.EipConfig = {} as any;
            req.PublicNetConfig.EipConfig.EipStatus = publicNetConfig.eipConfig.eipStatus;
        }
    }

    if (code) {
        req.Code = {} as any;
        req.Code.ZipFile = await code.generateAsync({ type: 'base64', platform: 'UNIX', compression: 'DEFLATE'  });
    }
    cleanObj(req);
}

function getFunction(namespace: string, functionName: string) {
    const scfClient = getScfClient();
    const getFunctionRequest: any = {};
    getFunctionRequest.FunctionName = functionName;
    getFunctionRequest.Namespace = namespace;
    return scfClient.GetFunction(getFunctionRequest);
}

async function createOrUpdateFunction(functionMeta: any, code: JSZip) {
    const scfClient = getScfClient();
    const scfClientExt = getScfClientExt();

    try {
        await getFunction(functionMeta.namespace, functionMeta.name);
        await spinner(`Update ${functionMeta.name} function`, async () => {
            const updateFunctionCodeRequest: any = {};
            updateFunctionCodeRequest.FunctionName = functionMeta.name;
            updateFunctionCodeRequest.Namespace = functionMeta.namespace;
            updateFunctionCodeRequest.Handler = functionMeta.handler;
            updateFunctionCodeRequest.ZipFile = await code.generateAsync({ type: 'base64', platform: 'UNIX', compression: 'DEFLATE'  });
            await scfClientExt.UpdateFunctionCode(updateFunctionCodeRequest);

            await checkStatus(functionMeta.namespace, functionMeta.name);

            const updateFunctionConfigurationRequest: any = {};
            updateFunctionConfigurationRequest.Publish = functionMeta.publish === true ? 'TRUE' : 'FALSE';
            updateFunctionConfigurationRequest.L5Enable = functionMeta.l5Enable === true ? 'TRUE' : 'FALSE';
            await parseFunctionMeta(updateFunctionConfigurationRequest, functionMeta);
            await scfClient.UpdateFunctionConfiguration(updateFunctionConfigurationRequest);
        });
    } catch (error) {
        if (error.code === 'ResourceNotFound.Function') {
            await spinner(`Create ${functionMeta.name} function`, async () => {
                const createFunctionRequest: any = {};
                await parseFunctionMeta(createFunctionRequest, functionMeta, code);
                createFunctionRequest.Handler = functionMeta.handler;
                createFunctionRequest.CodeSource = functionMeta.codeSource;
                createFunctionRequest.Type = functionMeta.type;
                await scfClientExt.CreateFunction(createFunctionRequest);
            });
        } else {
            throw error;
        }
    }

}

async function publishVersion(namespace: string, functionName: string) {
    const scfClient = getScfClient();
    const { functionVersion } = await spinner('Publish Version', async () => {
        await checkStatus(namespace, functionName);
        const publishVersionRequest: any = {};
        publishVersionRequest.FunctionName = functionName;
        publishVersionRequest.Namespace = namespace;
        const { FunctionVersion } = await scfClient.PublishVersion(publishVersionRequest);
        return {
            functionVersion: FunctionVersion,
            successText: `Publish Version ${FunctionVersion}`
        };
    });
    return functionVersion;
}

function parseAliasMeta(req: any, aliasMeta: any, functionVersion: string) {
    req.Name = aliasMeta.name;
    req.FunctionName = aliasMeta.functionName;
    req.Namespace = aliasMeta.namespace;
    req.FunctionVersion = functionVersion;
    req.Description = aliasMeta.description;
    const { routingConfig } = aliasMeta;
    if (routingConfig) {
        const { additionalVersionWeights, addtionVersionMatchs } = routingConfig;
        req.RoutingConfig = {} as any;
        if (additionalVersionWeights) {
            req.RoutingConfig.AdditionalVersionWeights = [];
            for (const w of additionalVersionWeights) {
                const additionalVersionWeight: any = {};
                additionalVersionWeight.Version = w.version;
                additionalVersionWeight.Weight = w.weight;
                req.RoutingConfig.AdditionalVersionWeights.push(additionalVersionWeight);
            }
        }

        if (addtionVersionMatchs) {
            req.RoutingConfig.AddtionVersionMatchs = [];
            for (const m of addtionVersionMatchs) {
                const addtionVersionMatch: any = {};
                addtionVersionMatch.Version = m.version;
                addtionVersionMatch.Key = m.key;
                addtionVersionMatch.Method = m.method;
                addtionVersionMatch.Expression = m.expression;
                req.RoutingConfig.AddtionVersionMatchs.push(addtionVersionMatch);
            }
        }
    }
    cleanObj(req);
}

async function createOrUpdateAlias(alias: any, functionVersion: string) {
    const scfClient = getScfClient();
    const getAliasRequest: any = {};
    getAliasRequest.Name = alias.name;
    getAliasRequest.FunctionName = alias.functionName;
    getAliasRequest.Namespace = alias.namespace;
    try {
        await checkStatus(alias.namespace, alias.functionName);
        await scfClient.GetAlias(getAliasRequest);
        await spinner(`Update ${alias.name} alias to version ${functionVersion}`, async () => {
            await checkStatus(alias.namespace, alias.functionName);
            const updateAliasRequest: any = {};
            parseAliasMeta(updateAliasRequest, alias, functionVersion);
            await scfClient.UpdateAlias(updateAliasRequest);
        });
    } catch (error) {
        if (error.code === 'ResourceNotFound.Alias') {
            await spinner(`Create ${alias.name} alias to version ${functionVersion}`, async () => {
                await checkStatus(alias.namespace, alias.functionName);
                const createAliasRequest: any = {};
                parseAliasMeta(createAliasRequest, alias, functionVersion);
                await scfClient.CreateAlias(createAliasRequest);
            });
        } else {
            throw error;
        }
    }
}

function parseServiceMeta(req: any, serviceMeta: any) {
    req.ServiceName = serviceMeta.name;
    req.Protocol = serviceMeta.protocol;
    req.ServiceDesc = serviceMeta.description;
    req.ExclusiveSetName = serviceMeta.exclusiveSetName;
    req.NetTypes = serviceMeta.netTypes;
    req.IpVersion = serviceMeta.ipVersion;
    req.SetServerName = serviceMeta.setServerName;
    req.AppIdType = serviceMeta.appIdType;
    cleanObj(req);
}

async function createOrUpdateService(service: any) {
    const apiClient = getApiClient();
    const describeServicesStatusRequest: any = {};
    let serviceId: string;
    let subDomain: string;
    const filter: any = {};
    filter.Name = 'ServiceName';
    filter.Values = [service.name];
    describeServicesStatusRequest.Filters = [filter];
    describeServicesStatusRequest.Limit = 100;
    const describeServicesStatusResponse = await apiClient.DescribeServicesStatus(describeServicesStatusRequest);
    const serviceSet = describeServicesStatusResponse.Result.ServiceSet.filter((item: any) => item.ServiceName === service.name);
    if (serviceSet.length > 1) {
        throw new Error(`There are two or more services named [${service.name}] in the api gateway`);
    } else if (serviceSet.length === 1) {
        await spinner(`Update ${service.name} service`, async () => {
            const [ s ] = serviceSet;

            const modifyServiceRequest: any = {};
            modifyServiceRequest.ServiceId = s.ServiceId;
            modifyServiceRequest.ServiceName = service.name;
            modifyServiceRequest.Protocol = service.protocol;
            modifyServiceRequest.ServiceDesc = service.description;
            modifyServiceRequest.NetTypes = service.netTypes;
            cleanObj(modifyServiceRequest);
            await apiClient.ModifyService(modifyServiceRequest);
            serviceId = s.ServiceId;
            subDomain = s.OuterSubDomain;
        });
    } else {
        await spinner(`Create ${service.name} service`, async () => {
            const createServiceRequest: any = {};
            parseServiceMeta(createServiceRequest, service);
            const res = await apiClient.CreateService(createServiceRequest);
            serviceId = res.ServiceId;
            subDomain = res.OuterSubDomain;
        });
    }

    return { serviceId: serviceId!, subDomain: subDomain! };
}

function parseApiMeta(req: any, apiMeta: any, serviceId: string, apiId?: string) {
    req.ServiceId = serviceId;
    req.ServiceType = 'SCF';
    req.ServiceTimeout = apiMeta.serviceTimeout;
    req.Protocol = apiMeta.protocol;
    req.RequestConfig = undefined;
    req.ApiName = apiMeta.name;
    req.ApiDesc = apiMeta.desc;
    req.ApiType = 'NORMAL';
    req.AuthType = apiMeta.authType;
    req.EnableCORS = apiMeta.enableCORS;
    req.ConstantParameters = undefined;
    req.RequestParameters = undefined;
    req.ApiBusinessType = apiMeta.businessType;
    req.ServiceMockReturnMessage = undefined;
    req.MicroServices = undefined;
    req.ServiceTsfLoadBalanceConf = undefined;
    req.ServiceTsfHealthCheckConf = undefined;
    req.TargetServices = undefined;
    req.TargetServicesLoadBalanceConf = undefined;
    req.TargetServicesHealthCheckConf = undefined;
    req.ServiceScfFunctionName = apiMeta.serviceScfFunctionName;
    req.ServiceScfFunctionType = apiMeta.serviceScfFunctionType;
    req.ServiceWebsocketRegisterFunctionName = undefined;
    req.ServiceWebsocketCleanupFunctionName = undefined;
    req.ServiceWebsocketTransportFunctionName = apiMeta.serviceWebsocketTransportFunctionName;
    req.ServiceScfFunctionNamespace = apiMeta.serviceScfFunctionNamespace;
    req.ServiceScfFunctionQualifier = apiMeta.serviceScfFunctionQualifier;
    req.ServiceWebsocketRegisterFunctionNamespace = undefined;
    req.ServiceWebsocketRegisterFunctionQualifier = undefined;
    req.ServiceWebsocketTransportFunctionNamespace = apiMeta.serviceWebsocketTransportFunctionNamespace;
    req.ServiceWebsocketTransportFunctionQualifier = apiMeta.serviceWebsocketTransportFunctionQualifier;
    req.ServiceWebsocketCleanupFunctionNamespace = undefined;
    req.ServiceWebsocketCleanupFunctionQualifier = undefined;
    req.ServiceScfIsIntegratedResponse = apiMeta.serviceScfIsIntegratedResponse;
    req.IsDebugAfterCharge = apiMeta.isDebugAfterCharge;
    req.IsDeleteResponseErrorCodes = apiMeta.isDeleteResponseErrorCodes;
    req.ResponseType = apiMeta.responseType;
    req.ResponseSuccessExample = apiMeta.responseSuccessExample;
    req.ResponseFailExample = apiMeta.responseFailExample;
    req.ServiceConfig = undefined;
    req.AuthRelationApiId = apiMeta.authRelationApiId;
    req.ServiceParameters = undefined;
    req.ResponseErrorCodes = undefined;
    req.TargetNamespaceId = undefined;
    req.UserType = apiMeta.userType;
    if (apiId) {
        req.ApiId = apiId;
    }

    const { oauthConfig, responseErrorCodes, requestConfig, requestParameters } = apiMeta;

    if (requestConfig) {
        req.RequestConfig = {};
        req.RequestConfig.Path = requestConfig.path;
        req.RequestConfig.Method = requestConfig.method;
    }

    if (requestParameters) {
        req.RequestParameters = [];
        for (const r of requestParameters) {
            const item: any = {};
            item.Name = r.name;
            item.Desc = r.desc;
            item.Postion = r.position;
            item.Type = r.type;
            item.DefaultValue = r.defaultValue;
            item.Required = r.required;
            req.RequestParameters.push(item);
        }
    }

    if (oauthConfig) {
        req.OauthConfig = {};
        req.OauthConfig.PublicKey = oauthConfig.publicKey;
        req.OauthConfig.TokenLocation = oauthConfig.tokenLocation;
        req.OauthConfig.LoginRedirectUrl = oauthConfig.loginRedirectUrl;
    }

    if (responseErrorCodes) {
        req.ResponseErrorCodes = [];
        for (const r of responseErrorCodes) {
            const item: any = {};
            item.Code = r.code;
            item.Msg = r.msg;
            item.Desc = r.desc;
            item.ConvertedCode = r.convertedCode;
            item.NeedConvert = r.needConvert;
            req.ResponseErrorCodes.push(item);
        }
    }
    cleanObj(req);
}

async function createOrUpdateApi(serviceId: string, subDomain: string, serviceProtocol: string, environmentName: string, api: any) {
    const apiClient = getApiClient();
    const apiName = api.name;
    const describeApisStatusRequest: any = {};
    const filter: any = {};
    let apiId: string;
    filter.Name = 'ApiName';
    filter.Values = [ apiName ];
    describeApisStatusRequest.Filters = [filter];
    describeApisStatusRequest.ServiceId = serviceId;
    describeApisStatusRequest.Limit = 100;
    const describeApisStatusResponse = await apiClient.DescribeApisStatus(describeApisStatusRequest);
    const apiIdStatusSet = describeApisStatusResponse.Result?.ApiIdStatusSet.filter((item: any) => item.ApiName === apiName);
    if (!apiIdStatusSet || apiIdStatusSet.length === 0) {
        await spinner(`Create ${apiName} api`, async () => {
            const createApiRequest: any = {};
            parseApiMeta(createApiRequest, api, serviceId);
            const { Result } = await apiClient.CreateApi(createApiRequest);
            apiId = Result.ApiId;
        });
    } else if (apiIdStatusSet.length > 1) {
        throw new Error(`There are two or more apis named [${apiName}] in the api gateway`);
    } else if (apiIdStatusSet?.length === 1) {
        await spinner(`Update ${apiName} api`, async () => {
            const modifyApiRequest: any = {};
            apiId = apiIdStatusSet[0].ApiId;
            parseApiMeta(modifyApiRequest, api, serviceId, apiId);
            try {
                await apiClient.ModifyApi(modifyApiRequest);
            } catch (err) {
                if (err.code === 'InternalError') {
                    await delay(1000);
                    await apiClient.ModifyApi(modifyApiRequest);
                } else {
                    throw err;
                }
            }
        });
    }
    const path = api.requestConfig.path.split('*')[0];
    const protocol = serviceProtocol.includes('https') ? 'https' : 'http';
    console.log(
        chalk`    - Url: {green.bold ${protocol}://${subDomain!}${environmentName === 'release' ? '' : `/${environmentName}`}${path}}`);

    return apiId!;
}

function parseCustomDomainMeta(req: any, customDomainMeta: any, serviceId: string, netSubDomain: string) {
    req.ServiceId = serviceId;
    req.SubDomain = customDomainMeta.name;
    req.IsDefaultMapping = customDomainMeta.isDefaultMapping;
    req.CertificateId = customDomainMeta.certificateId;
    req.Protocol = customDomainMeta.protocol;
    req.NetType = customDomainMeta.netType;
    req.NetSubDomain = netSubDomain;

    const { pathMappingSet } = customDomainMeta;

    if (pathMappingSet) {
        req.PathMappingSet = [];
        for (const m of pathMappingSet) {
            const item: any = {};
            item.Path = m.path;
            item.Environment = m.environment;
            req.PathMappingSet.push(item);
        }
    }
    cleanObj(req);

}

async function bindOrUpdateCustomDomain(serviceId: string, customDomain: any, netSubDomain: string) {
    const apiClient = getApiClient();
    const describeServiceSubDomainsRequest: any = {};
    describeServiceSubDomainsRequest.ServiceId = serviceId;
    const describeApisStatusResponse = await apiClient.DescribeServiceSubDomains(describeServiceSubDomainsRequest);
    const result = describeApisStatusResponse.Result;
    if (result.TotalCount > 0 && result.DomainSet.find((d: any) => d.DomainName === customDomain.name)) {
        await spinner(`Update ${customDomain.name} customDomain`, async () => {
            const modifySubDomainRequest: any = {};
            parseCustomDomainMeta(modifySubDomainRequest, customDomain, serviceId, netSubDomain);
            await apiClient.ModifySubDomain(modifySubDomainRequest);
        });
    } else {
        await spinner(`Create ${customDomain.name} customDomain`, async () => {
            const createSubDomainRequest: any = {};
            parseCustomDomainMeta(createSubDomainRequest, customDomain, serviceId, netSubDomain);
            await apiClient.CreateApi(createSubDomainRequest);
        });
    }

    console.log(chalk`    - Url: ${chalk.green.bold(
        `${customDomain.protocol.includes('https') ? 'https' : 'http'}://${customDomain.name}`)}`);
}

async function releaseService(serviceId: string, release: any) {
    const apiClient = getApiClient();
    await spinner(chalk`Release {yellow.bold ${release.environmentName}} environment`, async () => {
        const releaseServiceRequest: any = {};
        releaseServiceRequest.ServiceId = serviceId;
        releaseServiceRequest.EnvironmentName = release.environmentName;
        releaseServiceRequest.ReleaseDesc = release.desc;
        cleanObj(releaseServiceRequest);
        await apiClient.ReleaseService(releaseServiceRequest);
    });
}

function parseUsagePlanMeta(req: any, usagePalnMeta: any, usagePlanId?: string) {
    req.UsagePlanId = usagePlanId;
    req.UsagePlanName = usagePalnMeta.name;
    req.UsagePlanDesc = usagePalnMeta.desc;
    req.MaxRequestNum = usagePalnMeta.maxRequestNum;
    req.MaxRequestNumPreSec = usagePalnMeta.maxRequestNumPreSec;
    cleanObj(req);
}

async function createOrUpdateUsagePlan(usagePlan: any, api: any, apiId: string, serviceId: string) {
    const apiClient = getApiClient();
    const describeUsagePlansStatusRequest: any = {};
    const filter: any = {};
    filter.Name = 'UsagePlanName';
    filter.Values = [usagePlan.name];
    describeUsagePlansStatusRequest.Filters = [filter];
    describeUsagePlansStatusRequest.Limit = 100;
    const describeUsagePlansStatusResponse = await apiClient.DescribeUsagePlansStatus(describeUsagePlansStatusRequest);
    const usagePlanStatusSet = describeUsagePlansStatusResponse.Result?.UsagePlanStatusSet.filter((item: any) => item.UsagePlanName === usagePlan.name);
    if (!usagePlanStatusSet || usagePlanStatusSet.length === 0) {
        await spinner(`Create ${usagePlan.name} usage plan`, async () => {
            const createUsagePlanRequest: any = {};
            parseUsagePlanMeta(createUsagePlanRequest, usagePlan);
            const { Result } = await apiClient.CreateUsagePlan(createUsagePlanRequest);
            bindEnvironment(serviceId, apiId, api, usagePlan, Result!.UsagePlanId);
        });
    } else if (usagePlanStatusSet.length > 1) {
        throw new Error(`There are two or more usage plan named [${usagePlan.name}] in the api gateway`);
    } else if (usagePlanStatusSet.length === 1) {
        await spinner(`Update ${usagePlan.name} usage plan`, async () => {
            const [ u ] = usagePlanStatusSet;

            const modifyUsagePlanRequest: any = {};
            parseUsagePlanMeta(modifyUsagePlanRequest, usagePlan, u.UsagePlanId);
            await apiClient.ModifyUsagePlan(modifyUsagePlanRequest);
            bindEnvironment(serviceId, apiId, api, usagePlan, u.UsagePlanId);
        });
    }
}

async function bindEnvironment(serviceId: string, apiId: string, api: any, usagePlan: any, usagePalnId: string) {
    const apiClient = getApiClient();
    await spinner(`Bind ${usagePlan.name} usage plan to ${api.name} api`, async () => {
        const bindEnvironmentRequest: any = {};
        bindEnvironmentRequest.ServiceId = serviceId;
        bindEnvironmentRequest.BindType = 'API';
        bindEnvironmentRequest.UsagePlanIds = [ usagePalnId ];
        bindEnvironmentRequest.Environment = usagePlan.environment;
        cleanObj(bindEnvironmentRequest);
        await apiClient.BindEnvironment(bindEnvironmentRequest);
    });
}

async function updateApiEnvironmentStrategy(serviceId: string, apiId: string, api: any, strategy: any) {
    const apiClient = getApiClient();
    await spinner(`Update ${strategy.EnvironmentName} environment strategy to ${api.name} api`, async () => {
        const modifyApiEnvironmentStrategyRequest: any = {};
        modifyApiEnvironmentStrategyRequest.ServiceId = serviceId;
        modifyApiEnvironmentStrategyRequest.ApiIds = [ apiId ];
        modifyApiEnvironmentStrategyRequest.EnvironmentName = strategy.environmentName;
        modifyApiEnvironmentStrategyRequest.Strategy = strategy.strategy;
        cleanObj(modifyApiEnvironmentStrategyRequest);
        await apiClient.ModifyApiEnvironmentStrategy(modifyApiEnvironmentStrategyRequest);
    });
}

async function checkStatus(namespace: string, functionName: string) {
    let status = 'Updating';
    let times = 200;
    while ((status !== 'Active') && times > 0) {
        const tempFunc = await getFunction(namespace, functionName);
        status = tempFunc.Status;
        await delay(200);
        times = times - 1;
    }
    if (status !== 'Active') {
        throw new Error(`Please check function status: ${functionName}`);
    }
}

async function spinner(options: string | ora.Options | undefined, cb: () => any, successText?: string, failText?: string) {
    let opts: any = options;
    if (typeof options === 'string') {
        opts = { text: options, discardStdin: false };
    } else {
        opts.discardStdin = false;
    }
    const s = ora(opts).start();
    try {
        const ret = await cb();
        if (ret && ret.successText) {
            s.succeed(ret.successText);
        } else {
            s.succeed(successText);
        }
        return ret;
    } catch (error) {
        s.fail(failText);
        throw error;
    }
}
