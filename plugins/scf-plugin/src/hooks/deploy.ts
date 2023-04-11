import { DeployContext, ConfigUtil, PathUtil, SpinnerUtil, ProjectUtil } from '@malagu/cli-common';
import * as JSZip from 'jszip';
import * as traverse from 'traverse';
import * as delay from 'delay';
import { CloudUtils, DefaultProfileProvider, Profile } from '@malagu/cloud-plugin';
import { DefaultCodeLoader } from '@malagu/code-loader-plugin';
import * as COS from 'cos-nodejs-sdk-v5';
import { checkStatus, createBucketIfNeed, createClients, getAlias, getApi, getCustomDomain, getFunction, getLayer, getNamespace, getService, getTrigger, getUsagePlan } from './utils';
const chalk = require('chalk');

let cosClient: COS;
let scfClient: any;
let scfClientExt: any;
let apiClient: any;
let projectId: string;

export default async (context: DeployContext) => {
    const { cfg, pkg } = context;

    const { stage } = ConfigUtil.getBackendConfig(cfg);

    const cloudConfig = CloudUtils.getConfiguration(cfg);

    const profileProvider = new DefaultProfileProvider();
    const { region, credentials, account, appId } = await profileProvider.provide(cloudConfig) as (Profile & { appId?: string });

    const clients = await createClients(region, credentials);
    cosClient = clients.cosClient;
    scfClient = clients.scfClient;
    scfClientExt = clients.scfClientExt;
    apiClient = clients.apiClient;

    const { namespace, layer, apiGateway, alias, trigger, disableProjectId } = cloudConfig;
    const functionMeta = cloudConfig.function;

    console.log(`\nDeploying ${chalk.bold.yellow(pkg.pkg.name)} to the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);
    console.log(chalk`{bold.cyan - Profile: }`);
    console.log(`    - AccountId: ${account?.id}`);
    console.log(`    - Region: ${region}`);

    console.log(chalk`{bold.cyan - SCF:}`);

    if (namespace?.sync) {
        await createOrUpdateNamespace(namespace);
        delete namespace.sync;
    }

    await publishLayerIfNeed(layer, region, appId);

    functionMeta.namespace = functionMeta.namespace || namespace?.name;

    const namespaceName = functionMeta.namespace;
   
    await createOrUpdateFunction(functionMeta, disableProjectId, region, appId);

    const functionVersion = await publishVersion(namespaceName, functionMeta.name);

    await createOrUpdateAlias(alias, namespaceName, functionMeta.name, functionVersion);

    if (trigger) {
        await createTrigger(trigger, namespaceName, functionMeta.name, functionVersion, alias);
    }

    if (apiGateway) {
        console.log(chalk`\n{bold.cyan - API Gateway:}`);
        const { usagePlan, strategy, api, service, release, customDomain } = apiGateway;
        service.name = disableProjectId ? service.name : `${service.name}_${projectId}`;
        const { serviceId, subDomain } = await createOrUpdateService(service);
        api.serviceScfFunctionName = functionMeta.name;
        api.serviceScfFunctionNamespace = namespaceName;
        api.serviceWebsocketTransportFunctionName = functionMeta.name;
        api.serviceWebsocketTransportFunctionNamespace = namespaceName;
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
    createTriggerRequest.TriggerDesc = trigger.type === 'timer' ? trigger.triggerDesc : JSON.stringify(trigger.triggerDesc);
    await SpinnerUtil.start(`Set a ${trigger.name} Trigger`, async () => {
        const Result = await scfClient.CreateTrigger(createTriggerRequest);
        url = JSON.parse(Result.TriggerInfo.TriggerDesc)?.service?.subDomain;
    });
    
    if (url) {
        console.log(chalk`    - Url: {green.bold ${url}}`);
    }
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

async function parseFunctionMeta(req: any, functionMeta: any) {
    req.FunctionName = functionMeta.name;
    req.Description = functionMeta.description;
    req.MemorySize = functionMeta.memorySize;
    req.Timeout = functionMeta.timeout;
    req.Runtime = functionMeta.runtime;
    req.Namespace = functionMeta.namespace;
    req.Role = functionMeta.role;
    req.ClsLogsetId = functionMeta.clsLogsetId;
    req.ClsTopicId = functionMeta.clsTopicId;
    req.InitTimeout = functionMeta.initTimeout;
    req.AsyncRunEnable = parseBoolean(functionMeta.asyncRunEnable);
    req.TraceEnable = parseBoolean(functionMeta.traceEnable);
    req.ProtocolType = functionMeta.protocolType
    req.InstallDependency = parseBoolean(functionMeta.installDependency);

    const { env, vpcConfig, cfsConfig, layers, deadLetterConfig, publicNetConfig, protocolParams, instanceConcurrencyConfig } = functionMeta;
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

    if (instanceConcurrencyConfig) {
        req.InstanceConcurrencyConfig = {
            MaxConcurrency: instanceConcurrencyConfig.maxConcurrency,
            DynamicEnabled: parseBoolean(instanceConcurrencyConfig.dynamicEnabled)
        };
    }

    if (vpcConfig) {
        req.VpcConfig = {} as any;
        req.VpcConfig.VpcId = vpcConfig.vpcId;
        req.VpcConfig.SubnetId = vpcConfig.subnetId;
    }

    if (cfsConfig?.cfsInsList){
        req.CfsConfig = {
            CfsInsList: cfsConfig.cfsInsList.map((item: any) => ({
                UserId: item.userId || 10000,
                UserGroupId: item.userGroupId || 10000,
                CfsId: item.cfsId,
                MountInsId: item.mountInsId,
                LocalMountDir: item.localMountDir,
                RemoteMountDir: item.remoteMountDir
            }))
        }        
    }

    if (layers) {
        req.Layers = [];
        for (const l of layers) {
            const layer: any = {};
            if (typeof l === 'string') {
                const layerInfo = await getLayer(scfClient, l);
                layer.LayerName = layerInfo.LayerName;
                layer.LayerVersion = layerInfo.LayerVersion;
            } else {
                const layer: any = {};
                layer.LayerName = l.name;
                layer.LayerVersion = l.version;
            }
            
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

    if (protocolParams) {
        req.ProtocolParams = { WSParams: { IdleTimeOut: protocolParams.wsParams.idleTimeOut }};
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


async function uploadCodeToCos(name: string, code: JSZip, region: string, appId: string) {
    const bucket = `malagu-scf-${region}-code-${appId}`;
    const key = `${name}-${Math.floor(Date.now() / 1000)}.zip`;
    try {
        await createBucketIfNeed(cosClient, bucket, region);
    } catch (e) {
        if (e.code !== 'BucketAlreadyExists' || e.code !== 'BucketAlreadyOwnedByYou' || e.code !== 'TooManyBuckets') {
            await createBucketIfNeed(cosClient, bucket, region);
        } else {
            throw e;
        }
    }
    await cosClient.putObject({ Region: region, Bucket: bucket, Key: key, Body: await code.generateAsync({ type: 'nodebuffer', platform: 'UNIX', compression: 'DEFLATE' }) });
    return { bucket, key, region };
}

async function parseCode(req: any, meta: any, region: string, appId?: string) {
    let s3Uri = CloudUtils.parseS3Uri(meta.codeUri);
    let code: JSZip | undefined;
    if (!s3Uri) {
        const codeLoader = new DefaultCodeLoader();
        code = await codeLoader.load(PathUtil.getProjectDistPath(), meta.codeUri);
        if (appId) {
            s3Uri = await uploadCodeToCos(meta.name, code, region, appId);
        }
    }

    if (s3Uri) {
        req.CodeSource = 'Cos';
        req.Code = {
            CosBucketName: s3Uri.bucket,
            CosObjectName: s3Uri.key,
            CosBucketRegion: s3Uri.region
        };
    } else {
        req.CodeSource = meta.codeSource;
        req.Code = { ZipFile: await code!.generateAsync({ type: 'base64', platform: 'UNIX', compression: 'DEFLATE' }) };
    }
}

async function publishLayerIfNeed(layer: any = {}, region: string, appId?: string) {
    if (!layer.name || !layer.codeUri) {
        return;
    }
    const layerInfo = await getLayer(scfClient, layer.name);
    if (!layerInfo || layer.sync) {
        await SpinnerUtil.start(`Publish ${layer.name} layer`, async () => {
            const publishLayerVersionRequest: any = {
                LayerName: layer.name,
                CompatibleRuntimes: layer.compatibleRuntime,
                Description: layer.description,
                LicenseInfo: layer.licenseInfo
            };
            await parseCode(publishLayerVersionRequest, layer, region, appId);
            publishLayerVersionRequest.Content = publishLayerVersionRequest.Code;
            delete publishLayerVersionRequest.CodeSource;

            await scfClient.PublishLayerVersion(publishLayerVersionRequest);
        });
    } else {
        await SpinnerUtil.start(`Skip ${layer.name} layer`, async () => { });
    }
}

function parseBoolean(value?: boolean) {
    if (value !== undefined) {
        return value === true ? 'TRUE' : 'FALSE'
    }
}

async function createOrUpdateFunction(functionMeta: any, disableProjectId: boolean, region: string, appId?: string) {
    let functionInfo: any;
    projectId = await ProjectUtil.getProjectId();
    if (disableProjectId) {
        functionInfo = await getFunction(scfClient, functionMeta.namespace, functionMeta.name);
    } else {
        if (!projectId) {
            await tryCreateProjectId(functionMeta.namespace, functionMeta.name);
            await ProjectUtil.saveProjectId(projectId);
            functionMeta.name = `${functionMeta.name}_${projectId}`;
        } else {
            functionMeta.name = `${functionMeta.name}_${projectId}`;
            functionInfo = await getFunction(scfClient, functionMeta.namespace, functionMeta.name);
        }
    }

    if (functionInfo) {
        await SpinnerUtil.start(`Update ${functionMeta.name} function${functionMeta.sync === 'onlyUpdateCode' ? ' (only update code)' : ''}`, async () => {
            const updateFunctionCodeRequest: any = {};
            updateFunctionCodeRequest.FunctionName = functionMeta.name;
            updateFunctionCodeRequest.Namespace = functionMeta.namespace;
            updateFunctionCodeRequest.Handler = functionMeta.handler;
            updateFunctionCodeRequest.EnvId = functionMeta.envId;
            await parseCode(updateFunctionCodeRequest, functionMeta, region, appId);
            await scfClientExt.UpdateFunctionCode(updateFunctionCodeRequest);

            await checkStatus(scfClient, functionMeta.namespace, functionMeta.name);

            if (functionMeta.sync !== 'onlyUpdateCode') {
                const updateFunctionConfigurationRequest: any = {};
                updateFunctionConfigurationRequest.Publish = parseBoolean(functionMeta.publish);
                updateFunctionConfigurationRequest.L5Enable = parseBoolean(functionMeta.l5Enable);
                await parseFunctionMeta(updateFunctionConfigurationRequest, functionMeta);
                delete updateFunctionConfigurationRequest.Runtime;
                delete updateFunctionConfigurationRequest.ProtocolType;
                await scfClient.UpdateFunctionConfiguration(updateFunctionConfigurationRequest);
            }

        });
    } else {
        await SpinnerUtil.start(`Create ${functionMeta.name} function`, async () => {
            const createFunctionRequest: any = {};
            await parseFunctionMeta(createFunctionRequest, functionMeta);
            await parseCode(createFunctionRequest, functionMeta, region, appId);
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
