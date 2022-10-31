import { DeployContext, PathUtil, ProjectUtil, SpinnerUtil } from '@malagu/cli-common';
import { readFile, createWriteStream, remove } from 'fs-extra';
import { join } from 'path';
import * as JSZip from 'jszip';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';
import { DefaultCodeLoader } from '@malagu/code-loader-plugin';
import { createClients, getAlias, getApi, getCustomDomain, getFunction, getGroup, getLayer, getService, getTrigger, parseDomain } from './utils';
import * as api from './api';
import { retry } from '@malagu/cli-common/lib/utils';
import { tmpdir } from 'os';
import { v4 } from 'uuid';
const chalk = require('chalk');
import { CodeUri } from '@malagu/code-loader-plugin/lib/code-protocol';

let fcClient: any;
let apiClient: any;
let ram: any;
let projectId: string;

export default async (context: DeployContext) => {

    const { cfg, pkg } = context;

    const cloudConfig = CloudUtils.getConfiguration(cfg);

    const profileProvider = new DefaultProfileProvider();
    const { region, account, credentials } = await profileProvider.provide(cloudConfig);
    const clients = await createClients(cloudConfig, region, credentials, account);
    fcClient = clients.fcClient;
    apiClient = clients.apiClient;
    ram = clients.ram;

    const { service, layer, trigger, apiGateway, customDomain, alias, disableProjectId } = cloudConfig;
    const functionMeta = cloudConfig.function;
    const serviceName = service.name;

    console.log(`\nDeploying ${chalk.bold.yellow(pkg.pkg.name)} to the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);
    console.log(chalk`{bold.cyan - Profile: }`);
    console.log(`    - AccountId: ${account?.id}`);
    console.log(`    - Region: ${region}`);

    console.log(chalk`{bold.cyan - FC:}`);

    if (service.sync) {
        await createOrUpdateService(serviceName, service);
        delete service.sync;
    }

    await publishLayerIfNeed(layer);

    delete functionMeta.callbackWaitsForEmptyEventLoop;
    await createOrUpdateFunction(functionMeta, disableProjectId);

    const { data: { versionId } } = await fcClient.publishVersion(serviceName);

    await createOrUpdateAlias(alias, serviceName, versionId);

    if (apiGateway) {
        console.log(chalk`\n{bold.cyan - API Gateway:}`);
        const { group, api, stage } = apiGateway;
        const role = await createRoleIfNeed();
        group.name = disableProjectId ? group.name : `${group.name}_${projectId}`;
        const { groupId, subDomain } = await createOrUpdateGroup(group);
        if (api.serviceConfig.functionComputeConfig) {
            api.serviceConfig.functionComputeConfig.serviceName = serviceName;
            api.serviceConfig.functionComputeConfig.functionName = functionMeta.name;
        }
        const apiId = await createOrUpdateApi(region, groupId, subDomain, stage.name, api, role);
        await deployApi(groupId, apiId, stage);
    }

    if (trigger?.triggerType === 'timer') {
        await createOrUpdateTimerTrigger(trigger, serviceName, functionMeta.name);
    } else if (trigger?.triggerType === 'http') {
        await createOrUpdateHttpTrigger(trigger, serviceName, functionMeta.name, region, account.id);
    } else if (trigger) {
        await createOrUpdateTrigger(trigger, serviceName, functionMeta.name);
    }

    if (customDomain?.name) {
        for (const route of customDomain.routeConfig.routes) {
            route.serviceName = route.serviceName || serviceName;
            route.functionName = route.functionName || functionMeta.name;
            route.qualifier = route.qualifier || alias.name;
        }
        await createOrUpdateCustomDomain(customDomain, alias.name, {
            type: 'fc',
            user: account.id,
            region: region.replace(/_/g, '-').toLocaleLowerCase(),
            service: serviceName.replace(/_/g, '-').toLocaleLowerCase(),
            function: functionMeta.name.replace(/_/g, '-').toLocaleLowerCase()
        });

    }

    console.log('Deploy finished');
    console.log();

};

async function deployApi(groupId: string, apiId: string, stage: any) {
    await SpinnerUtil.start(chalk`Deploy {yellow.bold ${stage.name}} environment`, async () => {
        await apiClient.deployApi({
            GroupId: groupId,
            ApiId: apiId,
            StageName: stage.name,
            Description: stage.description
        });
    });
}

function parseApiMeta(apiMeta: any, region: string, groupId: string, role: any, apiId?: string) {
    const req: any = {};
    req.GroupId = groupId;
    req.Visibility = apiMeta.visibility;
    req.ServiceTimeout = apiMeta.serviceTimeout;
    req.ApiName = apiMeta.name;
    req.Description = apiMeta.description;
    req.AuthType = apiMeta.authType;
    req.ForceNonceCheck = apiMeta.forceNonceCheck;
    req.ResultType = apiMeta.resultType;
    req.ResultSample = apiMeta.resultSample;
    req.FailResultSample = apiMeta.failResultSample;
    if (apiId) {
        req.ApiId = apiId;
    }

    const { openIdConnectConfig, serviceConfig, requestConfig, errorCodeSamples,
        requestParameters, serviceParameters, serviceParametersMap } = apiMeta;

    if (requestConfig) {
        req.RequestConfig = JSON.stringify({
            RequestHttpMethod: requestConfig.requestHttpMethod || requestConfig.method,
            RequestProtocol: requestConfig.requestProtocol || requestConfig.protocol,
            BodyFormat: requestConfig.bodyFormat,
            PostBodyDescription: requestConfig.postBodyDescription,
            RequestPath: requestConfig.requestPath || requestConfig.path,
            RequestMode: requestConfig.requestMode || requestConfig.mode
        });
    }

    if (requestParameters) {
        req.RequestParameters = [];
        for (const r of requestParameters) {
            const item: any = {};
            item.ApiParameterName = r.name;
            item.Description = r.desc || r.description;
            item.Location = r.location || r.position;
            item.ParameterType = r.type;
            item.DefaultValue = r.defaultValue;
            item.Required = r.required;
            req.RequestParameters.push(item);
        }
        req.RequestParameters = JSON.stringify(req.RequestParameters);
    }

    if (serviceParameters) {
        req.ServiceParameters = [];
        for (const s of serviceParameters) {
            const item: any = {};
            item.ServiceParameterName = s.name;
            item.Location = s.location || s.position;
            item.Type = s.type;
            item.ParameterCatalog = s.catalog;
            req.ServiceParameters.push(item);
        }
        req.ServiceParameters = JSON.stringify(req.ServiceParameters);
    }

    if (serviceParametersMap) {
        req.ServiceParametersMap = [];
        for (const s of serviceParametersMap) {
            const item: any = {};
            item.ServiceParameterName = s.serviceParameterName;
            item.RequestParameterName = s.requestParameterName;
            req.ServiceParametersMap.push(item);
        }
        req.ServiceParametersMap = JSON.stringify(req.ServiceParametersMap);
    }

    if (openIdConnectConfig) {
        req.OauthConfig = JSON.stringify({
            IdTokenParamName: openIdConnectConfig.idTokenParamName,
            OpenIdApiType: openIdConnectConfig.openIdApiType,
            PublicKeyId: openIdConnectConfig.publicKeyId,
            PublicKey: openIdConnectConfig.publicKey
        });
    }

    if (serviceConfig) {
        req.ServiceConfig = JSON.stringify({
            ServiceProtocol: serviceConfig.serviceProtocol,
            ContentTypeValue: serviceConfig.contentTypeValue,
            Mock: serviceConfig.mock,
            MockResult: '',
            ServiceTimeout: serviceConfig.serviceTimeout,
            ServiceAddress: '',
            ServicePath: '',
            ServiceHttpMethod: '',
            ContentTypeCatagory: 'DEFAULT',
            ServiceVpcEnable: 'FALSE',
            FunctionComputeConfig: {
                FcRegionId: region,
                ServiceName: serviceConfig.functionComputeConfig.serviceName,
                FunctionName: serviceConfig.functionComputeConfig.functionName,
                Qualifier: serviceConfig.qualifier,
                RoleArn: role.Role.Arn

            }
        });
    }

    if (errorCodeSamples) {
        req.ErrorCodeSamples = [];
        for (const r of errorCodeSamples) {
            const item: any = {};
            item.Code = r.code;
            item.Message = r.msg;
            item.Description = r.description;
            req.ErrorCodeSamples.push(item);
        }
        req.ErrorCodeSamples = JSON.stringify(req.ErrorCodeSamples);
    }
    return req;
}

async function createOrUpdateApi(region: string, groupId: string, subDomain: string, stage: string, api: any, role: any) {
    const apiName = api.name;
    let apiId: string;
    const apiInfo = await getApi(apiClient, groupId, apiName);
    if (apiInfo) {
        await SpinnerUtil.start(`Update ${apiName} api`, async () => {
            apiId = apiInfo.ApiId;
            apiClient.modifyApi(parseApiMeta(api, region, groupId, role, apiId));
        });
    } else {
        await SpinnerUtil.start(`Create ${apiName} api`, async () => {
            const { ApiId } = await apiClient.createApi(parseApiMeta(api, region, groupId, role));
            apiId = ApiId;
        });
    }

    const path = api.requestConfig.path;
    console.log(chalk`    - Url: {green.bold ${api.requestConfig.protocol.includes('HTTPS') ? 'https' : 'http'}://${subDomain!}${path.split('*')[0]}}`);
    if (stage.toUpperCase() !== 'RELEASE') {
        console.log(chalk`    - X-Ca-Stage: added X-Ca-Stage: {yellow.bold ${stage}} to Header to access the {yellow.bold ${stage}} environment`);
    }

    return apiId!;
}

async function createOrUpdateHttpTrigger(trigger: any, serviceName: string, functionName: string, region: string, accountId: string) {
    const { triggerConfig } = trigger;

    const triggerInfo = await createOrUpdateTrigger(trigger, serviceName, functionName);
    const urlApi = `https://${accountId}.${region}.fc.aliyuncs.com/2016-08-15/proxy/${serviceName}.${trigger.qualifier}/${functionName}/`;
    const urlInternet: string = triggerInfo?.data?.urlInternet || ''
    const urlIntranet: string = triggerInfo?.data?.urlIntranet || ''
    const urlTest = urlInternet.replace('https://', 'http://').replace('fcapp.run', 'functioncompute.com')

    console.log(`    - Methods: ${triggerConfig.methods}`);
    console.log(chalk`    - Url[API]: ${chalk.green.bold(urlApi)}`);
    console.log(chalk`    - Url[Internet]: ${chalk.green.bold(urlInternet)}`);
    console.log(chalk`    - Url[Intranet]: ${chalk.green.bold(urlIntranet)}`);
    console.log(chalk`    - Url[Test]: ${chalk.green.bold(urlTest)}`);
}

async function createOrUpdateTimerTrigger(trigger: any, serviceName: string, functionName: string) {
    const { triggerConfig } = trigger;

    await createOrUpdateTrigger(trigger, serviceName, functionName);

    console.log(`    - Cron: ${triggerConfig.cronExpression}`);
    console.log(`    - Enable: ${triggerConfig.enable}`);
}

async function createOrUpdateTrigger(trigger: any, serviceName: string, functionName: string) {
    const opts = { ...trigger };
    opts.triggerName = opts.name;
    delete opts.functionName;
    delete opts.serviceName;
    delete opts.name;

    const { name } = trigger;

    const triggerInfo = await getTrigger(fcClient, serviceName, functionName, name);
    if (triggerInfo) {
        await SpinnerUtil.start(`Update ${name} trigger`, async () => {
            try {
                await fcClient.updateTrigger(serviceName, functionName, name, opts);
            } catch (error) {
                if (error.message?.includes('Updating trigger is not supported yet')) {
                    await fcClient.deleteTrigger(serviceName, functionName, name);
                    await fcClient.createTrigger(serviceName, functionName, opts);
                    return;
                }
                throw error;
            }
        });
    } else {
        await SpinnerUtil.start(`Create ${name} trigger`, async () => {
            await fcClient.createTrigger(serviceName, functionName, opts);
        });
    }

    return triggerInfo
}

async function createOrUpdateService(serviceName: string, option: any) {
    const opt = { ...option };
    delete opt.name;
    const serviceInfo = await getService(fcClient, serviceName);
    if (serviceInfo) {
        await SpinnerUtil.start(`Update ${serviceName} service`, async () => {
            await fcClient.updateService(serviceName, opt);
        });
    } else {
        await SpinnerUtil.start(`Create ${serviceName} service`, async () => {
            await fcClient.createService(serviceName, opt);
        });
    }
}

async function tryCreateProjectId(serviceName: string, functionName: string) {
    projectId = await ProjectUtil.createProjectId();
    const functionInfo = await getFunction(fcClient, serviceName, `${functionName}_${projectId}`);
    if (functionInfo) {
        await tryCreateProjectId(serviceName, functionName);
    }
}

async function parseCode(codeUri: CodeUri | string, withoutCodeLimit: boolean) {
    const s3Uri = CloudUtils.parseS3Uri(codeUri);
    let code: JSZip | undefined;
    if (!s3Uri) {
        const codeLoader = new DefaultCodeLoader();
        code = await codeLoader.load(PathUtil.getProjectDistPath(), codeUri);
    }

    if (s3Uri) {
        return {
            ossBucketName: s3Uri.bucket,
            ossObjectName: s3Uri.key
        };
    } else {
        if (withoutCodeLimit === true) {
            const _tmpdir = tmpdir();
            const zipFile = join(_tmpdir, v4());
            return new Promise((resolve, reject) =>
                code!.generateNodeStream({ type: 'nodebuffer', platform: 'UNIX', compression: 'DEFLATE', streamFiles: true })
                    .pipe(createWriteStream(zipFile))
                    .on('finish', () => {
                        resolve({
                            zipFile
                        });
                    })
                    .on('error', error => {
                        reject(error);
                    })
            );
        }
        return { zipFile: await code!.generateAsync({ type: 'base64', platform: 'UNIX', compression: 'DEFLATE' }) };
    }
}

async function publishLayerIfNeed(layer: any = {}) {
    if (!layer.name || !layer.codeUri) {
        return;
    }
    const layerInfo = await getLayer(fcClient, layer.name);
    if (!layerInfo || layer.sync) {
        const opts = { ...layer };
        delete opts.codeUri;
        delete opts.name;
        delete layer.sync;

        await SpinnerUtil.start(`Publish ${layer.name} layer`, async () => {
            const code = await parseCode(layer.codeUri, layer.withoutCodeLimit);
            if (layer.withoutCodeLimit && (code as any).zipFile) {
                await fcClient.publishLayerVersion(layer.name, {
                    ...opts,
                    codeConfig: {
                        zipFilePath: (code as any).zipFile
                    }
                });
            } else {
                await fcClient.publishLayerVersion(layer.name, {
                    ...opts,
                    code: await parseCode(layer.codeUri, layer.withoutCodeLimit)
                });
            }
        });
    } else {
        await SpinnerUtil.start(`Skip ${layer.name} layer`, async () => { });
    }
}

async function createOrUpdateFunction(functionMeta: any, disableProjectId: boolean) {
    const opts = { ...functionMeta };
    const serviceName = opts.serviceName;
    const sync = opts.sync;
    opts.EnvironmentVariables = opts.env;
    delete opts.sync;
    delete opts.name;
    delete opts.env;
    delete opts.serviceName;
    delete opts.codeUri;

    if (sync !== 'onlyUpdateCode' && opts.layers) {
        const newLayers = [];
        for (const layer of opts.layers) {
            if (layer) {
                if (layer.includes('#')) {
                    newLayers.push(layer);
                } else {
                    const layerInfo = await getLayer(fcClient, layer);
                    newLayers.push(layerInfo.arn);
                }
            }
        }
        opts.layers = newLayers;
    }

    projectId = await ProjectUtil.getProjectId();
    let functionInfo: any;

    if (disableProjectId) {
        functionInfo = await getFunction(fcClient, serviceName, functionMeta.name);
    } else {
        if (!projectId) {
            await tryCreateProjectId(serviceName, functionMeta.name);
            await ProjectUtil.saveProjectId(projectId);
            functionMeta.name = `${functionMeta.name}_${projectId}`;
        } else {
            functionMeta.name = `${functionMeta.name}_${projectId}`;
            functionInfo = await getFunction(fcClient, serviceName, functionMeta.name);
        }
    }

    const code: any = await parseCode(functionMeta.codeUri, functionMeta.withoutCodeLimit);
    if (functionInfo) {
        delete opts.runtime;
        await SpinnerUtil.start(`Update ${functionMeta.name} function${sync === 'onlyUpdateCode' ? ' (only update code)' : ''}`, async () => {
            await fcClient.updateFunction(serviceName, functionMeta.name, {
                ...(sync === 'onlyUpdateCode' ? {} : opts),
                code
            });
        });
    } else {
        opts.functionName = functionMeta.name;
        await SpinnerUtil.start(`Create ${functionMeta.name} function`, async () => {
            await fcClient.createFunction(serviceName, {
                ...opts,
                code
            });
        });
    }
    if (functionMeta.withoutCodeLimit && code.zipFile) {
        remove(code.zipFile).catch(() => {});
    }
}

async function createOrUpdateCustomDomain(customDomain: any, qualifier: string, params: api.Params) {
    const { name, protocol, certConfig, routeConfig } = customDomain;
    let domainName = name;
    const opts: any = {
        protocol
    };

    if (domainName === 'auto') {
        await SpinnerUtil.start('Generated custom domain', async () => {
            domainName = await genDomain(params);
        });
    }

    if (certConfig?.certName) {
        opts.certConfig = { ...certConfig };
        const privateKey = certConfig.privateKey;
        const certificate = certConfig.certificate;

        if (privateKey?.endsWith('.key')) {
            opts.certConfig.privateKey = await readFile(privateKey, 'utf-8');
        }
        if (certificate?.endsWith('.pem')) {
            opts.certConfig.certificate = await readFile(certificate, 'utf-8');
        }
    }

    if (routeConfig) {
        opts.routeConfig = routeConfig;
    }
    const customDomainInfo = await getCustomDomain(fcClient, domainName);
    if (customDomainInfo) {
        const { data } = customDomainInfo;
        const routes: any[] = [];
        if (data?.routeConfig?.routes) {
            for (const route of data.routeConfig.routes) {
                const target = opts.routeConfig.routes.find((r: any) => r.path === route.path);
                if (target) {
                    routes.push({ ...route, ...target });
                    opts.routeConfig.routes.splice(opts.routeConfig.routes.findIndex((r: any) => r.path === target.path), 1);
                } else {
                    routes.push(route);
                }
            }
            opts.routeConfig.routes = [...opts.routeConfig.routes, ...routes];
        }
        await SpinnerUtil.start(`Update ${domainName} custom domain`, async () => {
            await fcClient.updateCustomDomain(domainName, opts);
        });
    } else {
        opts.domainName = domainName;
        await SpinnerUtil.start(`Create ${domainName} custom domain`, async () => {
            retry(async () => {
                await fcClient.createCustomDomain(domainName, opts);
            }, 1000, 5)
        });
    }
    let path = '';
    if (opts.routeConfig?.routes?.length) {
        for (const route of opts.routeConfig.routes) {
            if (route.qualifier === qualifier) {
                path = route.path?.split('*')[0] || '';
            }
        }
    }
    console.log(chalk`    - Url: ${chalk.green.bold(
        `${protocol.includes('HTTPS') ? 'https' : 'http'}://${domainName}${path}`)}`);
}

async function createOrUpdateAlias(alias: any, serviceName: string, versionId: string) {
    const aliasInfo = await getAlias(fcClient, alias.name, serviceName);
    if (aliasInfo) {
        await SpinnerUtil.start(`Update ${alias.name} alias to version ${versionId}`, async () => {
            await fcClient.updateAlias(serviceName, alias.name, versionId);
        });
    } else {
        await SpinnerUtil.start(`Create ${alias.name} alias to version ${versionId}`, async () => {
            await fcClient.createAlias(serviceName, alias.name, versionId);
        });
    }
}

function parseGroupMeta(groupMeta: any, groupId?: string) {
    return {
        GroupName: groupMeta.name,
        Description: groupMeta.description,
        GroupId: groupId
    };
}

async function createOrUpdateGroup(group: any) {
    const { name } = group;
    let groupId: string;
    let subDomain: string;
    const groupInfo = await getGroup(apiClient, name);
    if (groupInfo) {
        groupId = groupInfo.GroupId;
        subDomain = groupInfo.SubDomain;
        await SpinnerUtil.start(`Update ${name} group`, async () => {
            await apiClient.modifyApiGroup(parseGroupMeta(group, groupId), { timeout: 10000 });
        });
    } else {
        await SpinnerUtil.start(`Create ${name} group`, async () => {
            const { GroupId, SubDomain } = await apiClient.createApiGroup(parseGroupMeta(group), { timeout: 10000 });
            groupId = GroupId;
            subDomain = SubDomain;
        });
    }
    return { groupId: groupId!, subDomain: subDomain! };
}

function parseRoleMeta(roleName: string) {
    return {
        RoleName: roleName,
        Description: 'API Gateway access to FunctionCompute role',
        AssumeRolePolicyDocument: JSON.stringify({
            Statement: [
                {
                    Action: 'sts:AssumeRole',
                    Effect: 'Allow',
                    Principal: {
                        'Service': [
                            'apigateway.aliyuncs.com'
                        ]
                    }
                }
            ],
            Version: '1'
        })
    };
}

async function createRoleIfNeed() {
    const roleName = 'apigatewayAccessFC';
    let role;
    try {
        role = await ram.getRole({ RoleName: roleName }, { timeout: 10000 });
    } catch (ex) {
        if (ex.name !== 'EntityNotExist.RoleError') {
            throw ex;
        }
    }

    if (!role) {
        await SpinnerUtil.start(`Create ${roleName} role`, async () => {
            role = await ram.createRole(parseRoleMeta(roleName));
        });
    }

    const policyName = 'AliyunFCInvocationAccess';
    const policies = await ram.listPoliciesForRole({ RoleName: roleName });

    const policy = policies.Policies.Policy.find((item: any) => item.PolicyName === policyName);

    if (!policy) {
        await SpinnerUtil.start(`Attach ${policyName} policy`, async () => {
            await ram.attachPolicyToRole({
                PolicyType: 'System',
                PolicyName: policyName,
                RoleName: roleName
            });
        });
    }

    return role;
}


export async function genDomain(params: api.Params) {
    const serviceName = 'serverless-devs-check';
    const functionName = 'get-domain';
    const triggerName = 'httpTrigger';

    const { Body } = await api.token(params);
    const token = Body.Token;

    try {
        await fcClient.createService(serviceName, {});
    } catch (ex) {
        if (ex.code !== 'ServiceAlreadyExists') {
            throw ex;
        }
    }

    const functionConfig: any = {
        functionName,
        handler: 'index.handler',
        runtime: 'nodejs8',
        environmentVariables: { token },
    };

    try {
        await fcClient.updateFunction(serviceName, functionName, functionConfig);
    } catch (ex) {
        if (ex.code === 'FunctionNotFound') {
            // function code is `exports.handler = (req, resp, context) => resp.send(process.env.token || '');`;
            const zipFile = 'UEsDBAoAAAAIABULiFLOAhlFSQAAAE0AAAAIAAAAaW5kZXguanMdyMEJwCAMBdBVclNBskCxuxT9UGiJNgnFg8MX+o4Pc3R14/OQdkOpUFQ8mRQ2MtUujumJyv4PG6TFob3CjCEve78gtBaFkLYPUEsBAh4DCgAAAAgAFQuIUs4CGUVJAAAATQAAAAgAAAAAAAAAAAAAALSBAAAAAGluZGV4LmpzUEsFBgAAAAABAAEANgAAAG8AAAAAAA==';
            functionConfig.code = { zipFile };
            await fcClient.createFunction(serviceName, functionConfig);
        } else {
            throw ex;
        }
    }

    try {
        await fcClient.createTrigger(serviceName, functionName, {
            triggerName,
            triggerType: 'http',
            triggerConfig: {
                AuthType: 'anonymous',
                Methods: ['POST', 'GET'],
            },
        });
    } catch (ex) {
        if (ex.code !== 'TriggerAlreadyExists') {
            throw ex;
        }
    }

    await api.domain({ ...params, token });

    await fcClient.deleteTrigger(serviceName, functionName, triggerName);
    await fcClient.deleteFunction(serviceName, functionName);
    await fcClient.deleteService(serviceName);
    return Body.Domain || parseDomain(params);
}
