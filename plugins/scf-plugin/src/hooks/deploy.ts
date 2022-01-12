import { DeployContext, ConfigUtil, PathUtil, SpinnerUtil, ProjectUtil } from '@malagu/cli-common';
import * as JSZip from 'jszip';
import * as traverse from 'traverse';
import * as delay from 'delay';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';
import { DefaultCodeLoader } from '@malagu/code-loader-plugin';
import { checkStatus, createClients, getAlias, getApi, getCustomDomain, getFunction, getNamespace, getService, getTrigger, getUsagePlan } from './utils';
const chalk = require('chalk');

let scfClient: any;
let scfClientExt: any;
let apiClient: any;
let projectId: string;

export default async (context: DeployContext) => {
    const { cfg, pkg } = context;

    const { stage } = ConfigUtil.getBackendConfig(cfg);

    const cloudConfig = CloudUtils.getConfiguration(cfg);

    const profileProvider = new DefaultProfileProvider();
    const { region, credentials, account } = await profileProvider.provide(cloudConfig);

    const clients = await createClients(region, credentials);
    scfClient = clients.scfClient;
    scfClientExt = clients.scfClientExt;
    apiClient = clients.apiClient;

    const { namespace, apiGateway, alias, trigger, disableProjectId } = cloudConfig;
    const functionMeta = cloudConfig.function;

    console.log(`\nDeploying ${chalk.bold.yellow(pkg.pkg.name)} to the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);
    console.log(chalk`{bold.cyan - Profile: }`);
    console.log(`    - AccountId: ${account?.id}`);
    console.log(`    - Region: ${region}`);

    console.log(chalk`{bold.cyan - SCF:}`);

    await createOrUpdateNamespace(namespace);

    const codeLoader = new DefaultCodeLoader();
    const zip = await codeLoader.load(PathUtil.getProjectDistPath(), functionMeta.codeUri);
    await createOrUpdateFunction(functionMeta, zip, disableProjectId);

    const functionVersion = await publishVersion(namespace.name, functionMeta.name);

    await createOrUpdateAlias(alias, namespace.name, functionMeta.name, functionVersion);

    if (trigger) {
        await createTrigger(trigger, namespace.name, functionMeta.name, functionVersion, alias);
    }

    if (apiGateway) {
        console.log(chalk`\n{bold.cyan - API Gateway:}`);
        const { usagePlan, strategy, api, service, release, customDomain } = apiGateway;
        service.name = `${service.name}_${projectId}`;
        const { serviceId, subDomain } = await createOrUpdateService(service);
        api.serviceScfFunctionName = functionMeta.name;
        api.serviceScfFunctionNamespace = namespace.name;
        api.serviceWebsocketTransportFunctionName = functionMeta.name;
        api.serviceWebsocketTransportFunctionNamespace = namespace.name;
        const apiId = await createOrUpdateApi(serviceId, subDomain, service.protocol, release.environmentName, api);
        if (customDomain?.name) {
            await bindOrUpdateCustomDomain(serviceId, customDomain, subDomain, release.environmentName);
        }

        if (usagePlan.maxRequestNum !== undefined || usagePlan.maxRequestNumPreSec !== undefined) {
            createOrUpdateUsagePlan(usagePlan, api, apiId, serviceId);
        }

        if (strategy.strategy !== undefined) {
            updateApiEnvironmentStrategy(serviceId, apiId, api, strategy);
        }

        await releaseService(serviceId, release, stage);

    }
    console.log();
};

function cleanObj(obj: any) {
    traverse(obj).forEach(function (value: any) {
        if (value === undefined) {
            // eslint-disable-next-line no-null/no-null
            this.update(null);
        }
    });
}

async function createTrigger(trigger: any, namespaceName: string, functionName: string, functionVersion: string, alias: any) {
    const triggerInfo = await getTrigger(scfClient, namespaceName, functionName, undefined, alias.name);
    if(triggerInfo?.Type === 'apigw'){
        const serviceId = JSON.parse(triggerInfo.TriggerDesc)?.service?.serviceId;
        trigger.triggerDesc.service.serviceId = serviceId;
    }
    if (triggerInfo) {
        const deleteTriggerRequest: any = {};
        deleteTriggerRequest.Namespace = namespaceName;
        deleteTriggerRequest.FunctionName = functionName;
        deleteTriggerRequest.Type = triggerInfo.Type;
        deleteTriggerRequest.TriggerName = triggerInfo.TriggerName;
        deleteTriggerRequest.Qualifier = triggerInfo.Qualifier;
        if (trigger.type === 'cos') {
            deleteTriggerRequest.TriggerDesc = triggerInfo.TriggerDesc;
        }
        await scfClient.DeleteTrigger(deleteTriggerRequest);

    }
    const createTriggerRequest: any = {};
    let url: string = '';
    createTriggerRequest.Namespace = namespaceName;
    createTriggerRequest.FunctionName = functionName;
    createTriggerRequest.Qualifier = alias.name;
    createTriggerRequest.TriggerName = trigger.name;
    createTriggerRequest.Type = trigger.type;
    createTriggerRequest.Enable = trigger.enable;
    createTriggerRequest.TriggerDesc = JSON.stringify(trigger.triggerDesc);
    await SpinnerUtil.start(`Set a ${trigger.name} Trigger`, async () => {
        const Result = await scfClient.CreateTrigger(createTriggerRequest);
        url = JSON.parse(Result.TriggerInfo.TriggerDesc)?.service?.subDomain;
    });
    
    console.log(chalk`    - Url: {green.bold ${url}}`);
    console.log(`    - Type: ${trigger.type}`);
    console.log(`    - Enable: ${trigger.enable}`);
}

async function createOrUpdateNamespace(namespace: any) {
    const namespaceInfo = await getNamespace(scfClient, namespace.name);
    if (namespaceInfo) {
        const updateNamespaceRequest: any = {};
        updateNamespaceRequest.Namespace = namespace.name;
        updateNamespaceRequest.Description = namespace.description;
        if (namespace.description) {
            await SpinnerUtil.start(`Update ${namespace.name} namespace`, async () => {
                await scfClient.UpdateNamespace(updateNamespaceRequest);
            });
        } else {
            await SpinnerUtil.start(`Skip ${namespace.name} namespace`, async () => { });
        }
    } else {
        await SpinnerUtil.start(`Create a ${namespace.name} namespace`, async () => {
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
        req.Code.ZipFile = await code.generateAsync({ type: 'base64', platform: 'UNIX', compression: 'DEFLATE' });
    }
    cleanObj(req);
}

async function tryCreateProjectId(namespaceName: string, functionName: string) {
    projectId = await ProjectUtil.createProjectId();
    const functionInfo = await getFunction(scfClient, namespaceName, `${functionName}_${projectId}`);
    if (functionInfo) {
        await tryCreateProjectId(namespaceName, functionName);
    }
}


async function createOrUpdateFunction(functionMeta: any, code: JSZip, disableProjectId: boolean) {
    let functionInfo: any;
    projectId = await ProjectUtil.getProjectId();
    if (!projectId && !disableProjectId) {
        await tryCreateProjectId(functionMeta.namespace, functionMeta.name);
        await ProjectUtil.saveProjectId(projectId);
        functionMeta.name = `${functionMeta.name}_${projectId}`;
    } else {
        functionMeta.name = disableProjectId ? `${functionMeta.name}` : `${functionMeta.name}_${projectId}`;
        functionInfo = await getFunction(scfClient, functionMeta.namespace, functionMeta.name);
    }

    if (functionInfo) {
        await SpinnerUtil.start(`Update ${functionMeta.name} function`, async () => {
            const updateFunctionCodeRequest: any = {};
            updateFunctionCodeRequest.FunctionName = functionMeta.name;
            updateFunctionCodeRequest.Namespace = functionMeta.namespace;
            updateFunctionCodeRequest.Handler = functionMeta.handler;
            updateFunctionCodeRequest.ZipFile = await code.generateAsync({ type: 'base64', platform: 'UNIX', compression: 'DEFLATE' });
            await scfClientExt.UpdateFunctionCode(updateFunctionCodeRequest);

            await checkStatus(scfClient, functionMeta.namespace, functionMeta.name);

            const updateFunctionConfigurationRequest: any = {};
            updateFunctionConfigurationRequest.Publish = functionMeta.publish === true ? 'TRUE' : 'FALSE';
            updateFunctionConfigurationRequest.L5Enable = functionMeta.l5Enable === true ? 'TRUE' : 'FALSE';
            await parseFunctionMeta(updateFunctionConfigurationRequest, functionMeta);
            await scfClient.UpdateFunctionConfiguration(updateFunctionConfigurationRequest);
        });
    } else {
        await SpinnerUtil.start(`Create ${functionMeta.name} function`, async () => {
            const createFunctionRequest: any = {};
            await parseFunctionMeta(createFunctionRequest, functionMeta, code);
            createFunctionRequest.Handler = functionMeta.handler;
            createFunctionRequest.CodeSource = functionMeta.codeSource;
            createFunctionRequest.Type = functionMeta.type;
            await scfClientExt.CreateFunction(createFunctionRequest);
        });
    }

}

async function publishVersion(namespace: string, functionName: string) {
    const { functionVersion } = await SpinnerUtil.start('Publish version', async () => {
        await checkStatus(scfClient, namespace, functionName);
        const publishVersionRequest: any = {};
        publishVersionRequest.FunctionName = functionName;
        publishVersionRequest.Namespace = namespace;
        const { FunctionVersion } = await scfClient.PublishVersion(publishVersionRequest);
        return {
            functionVersion: FunctionVersion,
            successText: `Publish version ${FunctionVersion}`
        };
    });
    return functionVersion;
}

function parseAliasMeta(req: any, aliasMeta: any, namespaceName: string, functionName: string, functionVersion: string) {
    req.Name = aliasMeta.name;
    req.FunctionName = functionName;
    req.Namespace = namespaceName;
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

async function createOrUpdateAlias(alias: any, namespaceName: string, functionName: string, functionVersion: string) {
    const aliasInfo = await getAlias(scfClient, alias.name, namespaceName, functionName, functionVersion);
    if (aliasInfo) {
        await SpinnerUtil.start(`Update ${alias.name} alias to version ${functionVersion}`, async () => {
            await checkStatus(scfClient, namespaceName, functionName, functionVersion);
            const updateAliasRequest: any = {};
            parseAliasMeta(updateAliasRequest, alias, namespaceName, functionName, functionVersion);
            await scfClient.UpdateAlias(updateAliasRequest);
        });
    } else {
        await SpinnerUtil.start(`Create ${alias.name} alias to version ${functionVersion}`, async () => {
            await checkStatus(scfClient, namespaceName, functionName, functionVersion);
            const createAliasRequest: any = {};
            parseAliasMeta(createAliasRequest, alias, namespaceName, functionName, functionVersion);
            await scfClient.CreateAlias(createAliasRequest);
        });
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
    let serviceId: string;
    let subDomain: string;
    const serviceInfo = await getService(apiClient, service.name);
   if (serviceInfo) {
        await SpinnerUtil.start(`Update ${service.name} service`, async () => {

            const modifyServiceRequest: any = {};
            modifyServiceRequest.ServiceId = serviceInfo.ServiceId;
            modifyServiceRequest.ServiceName = service.name;
            modifyServiceRequest.Protocol = service.protocol;
            modifyServiceRequest.ServiceDesc = service.description;
            modifyServiceRequest.NetTypes = service.netTypes;
            cleanObj(modifyServiceRequest);
            await apiClient.ModifyService(modifyServiceRequest);
            serviceId = serviceInfo.ServiceId;
            subDomain = serviceInfo.OuterSubDomain;
        });
    } else {
        await SpinnerUtil.start(`Create ${service.name} service`, async () => {
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
    const apiName = api.name;
    let apiId: string;
    const apiInfo = await getApi(apiClient, serviceId, apiName);
    if (!apiInfo) {
        await SpinnerUtil.start(`Create ${apiName} api`, async () => {
            const createApiRequest: any = {};
            parseApiMeta(createApiRequest, api, serviceId);
            const { Result } = await apiClient.CreateApi(createApiRequest);
            apiId = Result.ApiId;
        });
    } else {
        await SpinnerUtil.start(`Update ${apiName} api`, async () => {
            const modifyApiRequest: any = {};
            apiId = apiInfo.ApiId;
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

    const { pathMapping } = customDomainMeta;

    if (pathMapping) {
        req.IsDefaultMapping = false;
        req.PathMappingSet = [{
            Path: pathMapping.path,
            Environment: pathMapping.environment
        }];
    }
    cleanObj(req);

}

async function bindOrUpdateCustomDomain(serviceId: string, customDomain: any, netSubDomain: string, environmentName: string) {
    const customDomainInfo = await getCustomDomain(apiClient, serviceId, customDomain.name);
    if (customDomainInfo) {
        await SpinnerUtil.start(`Update ${customDomain.name} customDomain`, async () => {
            const modifySubDomainRequest: any = {};
            parseCustomDomainMeta(modifySubDomainRequest, customDomain, serviceId, netSubDomain);
            delete modifySubDomainRequest.NetSubDomain;
            await apiClient.ModifySubDomain(modifySubDomainRequest);
        });
    } else {
        await SpinnerUtil.start(`Create ${customDomain.name} customDomain`, async () => {
            const createSubDomainRequest: any = {};
            parseCustomDomainMeta(createSubDomainRequest, customDomain, serviceId, netSubDomain);
            await apiClient.BindSubDomain(createSubDomainRequest);
        });
    }

    const { pathMapping } = customDomain;
    const path = pathMapping?.path || '';
    console.log(chalk`    - Url: ${chalk.green.bold(
        `${customDomain.protocol.includes('https') ? 'https' : 'http'}://${customDomain.name}${path}`)}`);
}

async function releaseService(serviceId: string, release: any, stage: string) {
    await SpinnerUtil.start(chalk`Release {yellow.bold ${stage}} environment`, async () => {
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
    const usagePlanInfo = await getUsagePlan(apiClient, usagePlan.name);
    if (!usagePlanInfo) {
        await SpinnerUtil.start(`Create ${usagePlan.name} usage plan`, async () => {
            const createUsagePlanRequest: any = {};
            parseUsagePlanMeta(createUsagePlanRequest, usagePlan);
            const { Result } = await apiClient.CreateUsagePlan(createUsagePlanRequest);
            bindEnvironment(serviceId, apiId, api, usagePlan, Result!.UsagePlanId);
        });
    } else {
        await SpinnerUtil.start(`Update ${usagePlan.name} usage plan`, async () => {
            const modifyUsagePlanRequest: any = {};
            parseUsagePlanMeta(modifyUsagePlanRequest, usagePlan, usagePlanInfo.UsagePlanId);
            await apiClient.ModifyUsagePlan(modifyUsagePlanRequest);
            bindEnvironment(serviceId, apiId, api, usagePlan, usagePlanInfo.UsagePlanId);
        });
    }
}

async function bindEnvironment(serviceId: string, apiId: string, api: any, usagePlan: any, usagePalnId: string) {
    await SpinnerUtil.start(`Bind ${usagePlan.name} usage plan to ${api.name} api`, async () => {
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
    await SpinnerUtil.start(`Update ${strategy.EnvironmentName} environment strategy to ${api.name} api`, async () => {
        const modifyApiEnvironmentStrategyRequest: any = {};
        modifyApiEnvironmentStrategyRequest.ServiceId = serviceId;
        modifyApiEnvironmentStrategyRequest.ApiIds = [ apiId ];
        modifyApiEnvironmentStrategyRequest.EnvironmentName = strategy.environmentName;
        modifyApiEnvironmentStrategyRequest.Strategy = strategy.strategy;
        cleanObj(modifyApiEnvironmentStrategyRequest);
        await apiClient.ModifyApiEnvironmentStrategy(modifyApiEnvironmentStrategyRequest);
    });
}
