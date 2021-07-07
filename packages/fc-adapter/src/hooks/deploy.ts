import { DeployContext } from '@malagu/cli-service';
import { readFile } from 'fs-extra';
import { Credentials, Account } from '@malagu/cloud';
import { DefaultCodeLoader, FaaSAdapterUtils, DefaultProfileProvider } from '@malagu/faas-adapter/lib/hooks';
const FCClient = require('@alicloud/fc2');
import  * as JSZip from 'jszip';
import * as ora from 'ora';
const CloudAPI = require('@alicloud/cloudapi');
const Ram = require('@alicloud/ram');
const chalk = require('chalk');

let fcClient: any;
let apiClient: any;
let ram: any;

export default async (context: DeployContext) => {

    const { cfg, pkg } = context;

    const adapterConfig = FaaSAdapterUtils.getConfiguration<any>(cfg);

    const profileProvider = new DefaultProfileProvider();
    const { region, account, credentials } = await profileProvider.provide(adapterConfig);
    await createClients(adapterConfig, region, credentials, account);

    const { service, trigger, apiGateway, customDomain, alias } = adapterConfig;
    const functionMeta = adapterConfig.function;
    const serviceName = service.name;
    const functionName = functionMeta.name;

    console.log(`\nDeploying ${chalk.bold.yellow(pkg.pkg.name)} to the ${chalk.bold.blue(region)} region of Function Compute...`);
    console.log(chalk`{bold.cyan - FC:}`);

    await createOrUpdateService(serviceName, service);

    const codeLoader = new DefaultCodeLoader();
    const zip = await codeLoader.load(context, adapterConfig);
    delete functionMeta.codeUri;
    await createOrUpdateFunction(functionName, functionMeta, zip);

    const { data: { versionId } } = await fcClient.publishVersion(serviceName);

    await createOrUpdateAlias(alias, versionId);

    if (apiGateway) {
        console.log(chalk`\n{bold.cyan - API Gateway:}`);
        const { group, api, stage } = apiGateway;
        const role = await createRoleIfNeed();
        const { groupId, subDomain } = await createOrUpdateGroup(group);
        const apiId = await createOrUpdateApi(region, groupId, subDomain, stage.name, api, role);
        await deployApi(groupId, apiId, stage);
    }

    if (trigger?.triggerType === 'timer') {
        await createOrUpdateTimerTrigger(trigger);
    } else if (trigger?.triggerType === 'http') {
        await createOrUpdateHttpTrigger(trigger, region, account.id);
    } else if (trigger) {
        await createOrUpdateTrigger(trigger);
    }

    if (customDomain && customDomain.name) {
        for (const route of customDomain.routeConfig.routes) {
            route.serviceName = route.serviceName || serviceName;
            route.functionName = route.functionName || functionName;
            route.qualifier = route.qualifier || alias.name;
        }
        await createOrUpdateCustomDomain(customDomain);
    }

    console.log('Deploy finished');
    console.log();

};

async function createClients(adapterConfig: any, region: string, credentials: Credentials, account: Account) {
    fcClient = new FCClient(account.id, {
        accessKeyID: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        securityToken: credentials.token,
        region,
        timeout: adapterConfig.timeout,
        secure: adapterConfig.secure,
        internal: adapterConfig.internal
    });

    apiClient = new CloudAPI({
        accessKeyId: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        endpoint: `http://apigateway.${region}.aliyuncs.com`,
    });

    ram = new Ram({
        accessKeyId: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        endpoint: 'https://ram.aliyuncs.com'
    });
}

async function deployApi(groupId: string, apiId: string, stage: any) {
    await spinner(chalk`Deploy {yellow.bold ${stage.name}} environment`, async () => {
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
    const result = await apiClient.describeApis({
        ApiName: apiName,
        GroupId: groupId,
        PageSize: 100
    });
    const apis = result.ApiSummarys ? result.ApiSummarys.ApiSummary.filter((item: any) => item.ApiName === apiName) : [];
    if (apis.length > 1) {
        throw new Error(`There are two or more apis named [${apiName}] in the api gateway`);
    } else if (apis.length === 1) {
        await spinner(`Update ${apiName} api`, async () => {
            apiId = apis[0].ApiId;
            apiClient.modifyApi(parseApiMeta(api, region, groupId, role, apiId));
        });
    } else {
        await spinner(`Create ${apiName} api`, async () => {
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

async function createOrUpdateHttpTrigger(trigger: any, region: string, accountId: string) {
    const { functionName, serviceName, triggerConfig } = trigger;

    await createOrUpdateTrigger(trigger);

    console.log(`    - Methods: ${triggerConfig.methods}`);
    console.log(chalk`    - Url: ${chalk.green.bold(
        `https://${accountId}.${region}.fc.aliyuncs.com/2016-08-15/proxy/${serviceName}.${trigger.qualifier}/${functionName}/`)}`);
}

async function createOrUpdateTimerTrigger(trigger: any) {
    const { triggerConfig } = trigger;

    await createOrUpdateTrigger(trigger);

    console.log(`    - Cron: ${triggerConfig.cronExpression}`);
    console.log(`    - Enable: ${triggerConfig.enable}`);
}

async function createOrUpdateTrigger(trigger: any) {
    const opts = { ...trigger };
    opts.triggerName = opts.name;
    delete opts.functionName;
    delete opts.serviceName;
    delete opts.name;

    const { functionName, serviceName, name } = trigger;

    try {
        await fcClient.getTrigger(serviceName, functionName, name);
        await spinner(`Update ${name} trigger`, async () => {
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

    } catch (ex) {
        if (ex.code === 'TriggerNotFound') {
            await spinner(`Create ${name} trigger`, async () => {
                await fcClient.createTrigger(serviceName, functionName, opts);
            });
        } else {
            throw ex;
        }
    }

}

async function createOrUpdateService(serviceName: string, option: any) {
    const opt = { ...option };
    delete opt.name;
    try {
        await fcClient.getService(serviceName);
        await spinner(`Update ${serviceName} service`, async () => {
            await fcClient.updateService(serviceName, opt);
        });
    } catch (ex) {
        if (ex.code === 'ServiceNotFound') {
            await spinner(`Create ${serviceName} service`, async () => {
                await fcClient.createService(serviceName, opt);
            });
        } else {
            throw ex;
        }
    }
}

async function createOrUpdateFunction(functionName: string, functionMeta: any, code: JSZip) {
    const opts = { ...functionMeta };
    const serviceName = opts.serviceName;
    opts.EnvironmentVariables = opts.env;
    delete opts.name;
    delete opts.env;
    delete opts.serviceName;
    try {
        await fcClient.getFunction(serviceName, functionName);
        await spinner(`Update ${functionName} function`, async () => {
            await fcClient.updateFunction(serviceName, functionName, {
                ...opts,
                code: {
                    zipFile: await code.generateAsync({type: 'base64', platform: 'UNIX', compression: 'DEFLATE' })
                },
            });
        });

    } catch (ex) {
        if (ex.code === 'FunctionNotFound') {
            opts.functionName = functionName;
            await spinner(`Create ${functionName} function`, async () => {
                await fcClient.createFunction(serviceName, {
                    ...opts,
                    code: {
                        zipFile: await code.generateAsync({type: 'base64', platform: 'UNIX', compression: 'DEFLATE' })
                    },
                });
            });
        } else {
            throw ex;
        }
    }
}

async function createOrUpdateCustomDomain(customDomain: any) {
    const { name, protocol, certConfig, routeConfig } = customDomain;
    const opts: any = {
        protocol
    };

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
    try {
        const { data } = await fcClient.getCustomDomain(name);
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
            opts.routeConfig.routes = [ ...opts.routeConfig.routes, ...routes ];
        }
        await spinner(`Update ${name} custom domain`, async () => {
            await fcClient.updateCustomDomain(name, opts);
        });

    } catch (ex) {
        if (ex.code === 'DomainNameNotFound') {
            opts.domainName = name;
            await spinner(`Create ${name} custom domain`, async () => {
                await fcClient.createCustomDomain(name, opts);
            });
        } else {
            throw ex;
        }
    }
    console.log(chalk`    - Url: ${chalk.green.bold(
        `${protocol.includes('HTTPS') ? 'https' : 'http'}://${name}`)}`);
}

async function createOrUpdateAlias(alias: any, versionId: string) {
    try {
        await fcClient.getAlias(alias.serviceName, alias.name);
        await spinner(`Update ${alias.name} alias to version ${versionId}`, async () => {
            await fcClient.updateAlias(alias.serviceName, alias.name, versionId);
        });
    } catch (ex) {
        if (ex.code === 'AliasNotFound') {
            await spinner(`Create ${alias.name} alias to version ${versionId}`, async () => {
                await fcClient.createAlias(alias.serviceName, alias.name, versionId);
            });
        } else {
            throw ex;
        }
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
    const res = await apiClient.describeApiGroups({
        GroupName: name // filter out
    }, { timeout: 10000 });

    const groups = res.ApiGroupAttributes ? res.ApiGroupAttributes.ApiGroupAttribute : [];
    const list = groups.filter((item: any) => item.GroupName === name);
    if (list.length > 1) {
        throw new Error(`There are two or more groups named [${name}] in the api gateway`);
    } else if (list.length === 1) {
        groupId = list[0].GroupId;
        subDomain = list[0].SubDomain;
        await spinner(`Update ${name} group`, async () => {
            await apiClient.modifyApiGroup(parseGroupMeta(group, groupId), { timeout: 10000 });
        });
    } else {
        await spinner(`Create ${name} group`, async () => {
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
        await spinner(`Create ${roleName} role`, async () => {
            role = await ram.createRole(parseRoleMeta(roleName));
        });
    }

    const policyName = 'AliyunFCInvocationAccess';
    const policies = await ram.listPoliciesForRole({ RoleName: roleName });

    const policy = policies.Policies.Policy.find((item: any) => item.PolicyName === policyName);

    if (!policy) {
        await spinner(`Attach ${policyName} policy`, async () => {
            await ram.attachPolicyToRole({
                PolicyType: 'System',
                PolicyName: policyName,
                RoleName: roleName
            });
        });
    }

    return role;
}

async function spinner(options: string | ora.Options | undefined, cb: () => any) {
    let opts: any = options;
    if (typeof options === 'string') {
        opts = { text: options, discardStdin: false };
    } else {
        opts.discardStdin = false;
    }
    const s = ora(opts).start();
    try {
        await cb();
        s.succeed();
    } catch (error) {
        s.fail();
        throw error;
    }
}
