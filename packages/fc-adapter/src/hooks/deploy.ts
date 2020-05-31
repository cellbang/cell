import { DeployContext, BACKEND_TARGET, getHomePath, getConfig } from '@malagu/cli';
import { ProfileProvider, Profile } from './profile-provider';
import { join } from 'path';
import { readdirSync, statSync, readFileSync, existsSync, readFile } from 'fs-extra';
const FCClient = require('@alicloud/fc2');
import  * as JSZip from 'jszip';
import * as ora from 'ora';
const CloudAPI = require('@alicloud/cloudapi');
const Ram = require('@alicloud/ram');
const chalk = require('chalk');

let client: any;
let profile: Profile;
let devAlias: string;
let prodAlias: string;

export default async (context: DeployContext) => {
    const { pkg } = context;

    const deployConfig = getConfig(pkg, BACKEND_TARGET).deployConfig;

    const profileProvider = new ProfileProvider();
    profile = {
        ...await profileProvider.provide(),
        ...deployConfig.profile

    };

    devAlias = deployConfig.devAlias;
    prodAlias = deployConfig.prodAlias;

    doDeploy(context, deployConfig);

};

async function doDeploy(context: DeployContext, deployConfig: any) {
    const { pkg, prod } = context;
    const codeDir = getHomePath(pkg);
    if (!existsSync(codeDir)) {
        console.log(chalk`{yellow Please build app first with "malagu build"}`);
        return;
    }
    client = new FCClient(profile.accountId, {
        accessKeyID: profile.accessKeyId,
        accessKeySecret: profile.accessKeySecret,
        region: profile.defaultRegion,
        timeout: 600000
    });

    const { service, trigger, apiGateway, customDomain, type } = deployConfig;
    const fundtionMeta = deployConfig.function;
    const serviceName = service.name;
    const functionName = fundtionMeta.name;

    console.log(`Deploying ${chalk.bold.yellow(pkg.pkg.name)} to Function Compute...`);

    await createOrUpdateService(serviceName, service);

    const zip = new JSZip();
    await loadCode(codeDir, zip);

    await createOrUpdateFunction(serviceName, functionName, fundtionMeta, zip);

    const { data: { versionId } } = await client.publishVersion(serviceName);

    await createOrUpdateAlias(serviceName, devAlias, versionId);

    if (prod) {
        await createOrUpdateAlias(serviceName, prodAlias, versionId);
    }

    if (type === 'http' || type === 'custom') {
        await createOrUpdateHttpTrigger(serviceName, functionName, trigger, devAlias);
        if (prod) {
            await createOrUpdateHttpTrigger(serviceName, functionName, trigger, prodAlias);
        }
        if (customDomain && customDomain.name) {
            const { protocol, certConfig, routeConfig } = customDomain;
            const options: any = {
                protocol,

            };

            if (certConfig) {
                options.certConfig = {};
                const privateKey = certConfig.PrivateKey;
                const certificate = certConfig.Certificate;

                if (privateKey && privateKey.endsWith('.pem')) {
                    options.certConfig.PrivateKey = await readFile(privateKey, 'utf-8');
                }
                if (certificate && certificate.endsWith('.pem')) {
                    options.certConfig.Certificate = await readFile(certificate, 'utf-8');
                }
            }

            if (routeConfig) {
                options.routeConfig = routeConfig;
            }

            await createOrUpdateCustomDomain(customDomain.name, options);
        }
    }

    if (type === 'api-gateway') {
        console.log('- API Gateway:');
        const apiGroup = await createGroupIfNeed(apiGateway.group);
        await deployApi(serviceName, functionName, apiGateway, apiGroup, devAlias);
        if (prod) {
            await deployApi(`${serviceName}.${prodAlias}`, functionName, apiGateway, apiGroup, prodAlias);
        }
    }
    console.log('Deploy finished');

}

function createCloudAPI() {
    return new CloudAPI({
        accessKeyId: profile.accessKeyId,
        accessKeySecret: profile.accessKeySecret,
        endpoint: `http://apigateway.${profile.defaultRegion}.aliyuncs.com`,
    });

}

async function deployApi(serviceName: string, functionName: string, option: any, apiGroup: any, alias: string) {
    const { api, stage } = option;
    const opt = { ...api };
    opt.name = `${opt.name}_${alias}`;
    opt['function'] = `${profile.defaultRegion}/${serviceName}.${alias}/${functionName}`;
    const ag = createCloudAPI();

    const ram = new Ram({
        accessKeyId: profile.accessKeyId,
        accessKeySecret: profile.accessKeySecret,
        endpoint: 'https://ram.aliyuncs.com'
    });

    const role = await createRoleIfNeed(ram, 'apigatewayAccessFC');

    const _api = await createOrUpdateAPI(ag, apiGroup, opt, role);

    await ag.deployApi({
        GroupId: apiGroup.GroupId,
        ApiId: _api.ApiId,
        StageName: stage,
        Description: `deployed by malagu at ${new Date().toISOString()}`
    });

    const apiDetail = await ag.describeApi({
        GroupId: apiGroup.GroupId,
        ApiId: _api.ApiId
    });

    console.log('    - Url: %s http://%s%s',
        apiDetail.RequestConfig.RequestHttpMethod,
        apiGroup.SubDomain,
        apiDetail.RequestConfig.RequestPath);
    apiDetail.DeployedInfos.DeployedInfo.forEach((info: any) => {
        if (info.DeployedStatus === 'DEPLOYED') {
            console.log(`    - stage: ${info.StageName}, deployed, version: ${info.EffectiveVersion}`);
        } else {
            console.log(`    - stage: ${info.StageName}, undeployed`);
        }
    });
}

async function createOrUpdateHttpTrigger(serviceName: string, functionName: string, option: any, alias: string) {
    const opt = { ...option };
    opt.triggerName = `${opt.name}-${alias}`;
    delete opt.name;
    opt.qualifier = alias;

    try {
        await client.getTrigger(serviceName, functionName, opt.triggerName);
        await spinner(`Update ${opt.triggerName} trigger`, async () => {
            await client.updateTrigger(serviceName, functionName, opt.triggerName, opt);
        });

    } catch (ex) {
        if (ex.code === 'TriggerNotFound') {
            await spinner(`Create ${opt.triggerName} trigger`, async () => {
                await client.createTrigger(serviceName, functionName, opt);
            });
        } else {
            throw ex;
        }
    }
    console.log(`    - Methods: ${opt.triggerConfig.methods}`);
    console.log(chalk`    - Url: ${chalk.green.bold(
        `https://${profile.accountId}.${profile.defaultRegion}.fc.aliyuncs.com/2016-08-15/proxy/${serviceName}.${alias}/${functionName}/`)}`);
}

async function createOrUpdateService(serviceName: string, option: any) {
    try {
        delete option.name;
        await client.getService(serviceName);
        await spinner(`Update ${serviceName} service`, async () => {
            await client.updateService(serviceName, option);
        });
    } catch (ex) {
        if (ex.code === 'ServiceNotFound') {
            await spinner(`Create a ${serviceName} service`, async () => {
                await client.createService(serviceName, option);
            });
        } else {
            throw ex;
        }
    }
}

async function createOrUpdateFunction(serviceName: string, functionName: string, option: any, code: JSZip) {
    try {
        await client.getFunction(serviceName, functionName);
        await spinner(`Update ${functionName} function`, async () => {
            await client.updateFunction(serviceName, functionName, {
                ...option,
                code: {
                    zipFile: await code.generateAsync({type: 'base64', platform: 'UNIX'})
                },
            });
        });

    } catch (ex) {
        if (ex.code === 'FunctionNotFound') {
            delete option.name;
            option.functionName = functionName;
            await spinner(`Create ${functionName} function`, async () => {
                await client.createFunction(serviceName, {
                    ...option,
                    code: {
                        zipFile: await code.generateAsync({type: 'base64', platform: 'UNIX'})
                    },
                });
            });
        } else {
            throw ex;
        }
    }
}

async function createOrUpdateCustomDomain(domainName: string, option: any) {
    try {
        await client.getCustomDomain(domainName);
        await spinner(`Update ${domainName} custom domain`, async () => {
            await client.updateCustomDomain(domainName, {
                ...option
            });
        });

    } catch (ex) {
        if (ex.code === 'DomainNameNotFound') {
            delete option.name;
            option.domainName = domainName;
            await spinner(`Create ${domainName} custom domain`, async () => {
                await client.createCustomDomain(domainName, {
                    ...option
                });
            });
        } else {
            throw ex;
        }
    }
    console.log(chalk`    - Url: ${chalk.green.bold(
        `${option.protocol.includes('HTTPS') ? 'https' : 'http'}://${domainName}`)}`);
}

async function createOrUpdateAlias(serviceName: string, aliasName: string, versionId: string) {
    try {
        await client.getAlias(serviceName, aliasName);
        await spinner(`Update ${aliasName} alias to version ${versionId}`, async () => {
            await client.updateAlias(serviceName, aliasName, versionId);
        });
    } catch (ex) {
        if (ex.code === 'AliasNotFound') {
            await spinner(`Create ${aliasName} alias to version ${versionId}`, async () => {
                await client.createAlias(serviceName, aliasName, versionId);
            });
        } else {
            throw ex;
        }
    }
}

async function loadCode(codeDir: string, zip: JSZip) {
    const files = readdirSync(codeDir);
    await Promise.all(files.map(async fileName => {
        const fullPath = join(codeDir, fileName);
        const file = statSync(fullPath);
        if (file.isDirectory()) {
            const dir = zip.folder(fileName);
            await loadCode(fullPath, dir);
        } else {
            zip.file(fileName, readFileSync(fullPath), {
                unixPermissions: file.mode
            });
        }
    }));
}

async function createGroupIfNeed(group: any) {
    const ag = createCloudAPI();
    const groupName = group.name;
    const groupDescription = group.description;

    const groups = await ag.describeApiGroups({
        GroupName: groupName // filter out
    }, { timeout: 10000 });

    const list = groups.ApiGroupAttributes.ApiGroupAttribute;
    let findGroup = list.find((item: any) => item.GroupName === groupName);

    if (!findGroup) {
        await spinner({ indent: 4, text: `Create ${groupName} group` }, async () => {
            findGroup = await ag.createApiGroup({
                GroupName: groupName,
                Description: groupDescription
            }, { timeout: 10000 });
        });
    } else {
        console.log(`    - Skip ${groupName} group creation`);
    }

    return findGroup;
}

async function createRoleIfNeed(ram: any, roleName: string) {
    let role;
    try {
        role = await ram.getRole({
            RoleName: roleName
        }, { timeout: 10000 });
    } catch (ex) {
        if (ex.name !== 'EntityNotExist.RoleError') {
            throw ex;
        }
    }

    if (!role) {
        await spinner({ indent: 4, text: `Create ${roleName} role` }, async () => {
            role = await ram.createRole({
                RoleName: roleName,
                Description: 'API网关访问 FunctionCompute',
                AssumeRolePolicyDocument: JSON.stringify({
                    'Statement': [
                        {
                            'Action': 'sts:AssumeRole',
                            'Effect': 'Allow',
                            'Principal': {
                                'Service': [
                                    'apigateway.aliyuncs.com'
                                ]
                            }
                        }
                    ],
                    'Version': '1'
                })
            });
        });
    }

    const policyName = 'AliyunFCInvocationAccess';
    const policies = await ram.listPoliciesForRole({
        RoleName: roleName
    });

    const policy = policies.Policies.Policy.find((item: any) => item.PolicyName === policyName);

    if (!policy) {
        await ram.attachPolicyToRole({
            PolicyType: 'System',
            PolicyName: policyName,
            RoleName: roleName
        });
    }

    return role;
}

async function createOrUpdateAPI(ag: any, group: any, conf: any, role: any) {
    const apiName = conf.name;
    const [fcRegion, serviceName, functionName] = conf['function'].split('/');
    const groupId = group.GroupId;
    const result = await ag.describeApis({
        ApiName: apiName,
        GroupId: groupId
    });
    let api = result.ApiSummarys && result.ApiSummarys.ApiSummary[0];

    const method = conf.method || 'POST';
    const parameters = conf.parameters || [];
    const requestParameters = parameters.map((item: any) => ({
        ApiParameterName: item.name,
        Location: item.location || 'Query',
        ParameterType: item.type || 'String',
        Required: item.required
    }));
    const serviceParameters = parameters.map((item: any) => ({
        ServiceParameterName: item.name,
        Location: item.location || 'Query',
        Type: item.type || 'String',
        ParameterCatalog: 'REQUEST'
    }));
    const serviceParametersMap = parameters.map((item: any) => ({
        ServiceParameterName: item.name,
        RequestParameterName: item.name
    }));

    const params: any = {
        GroupId: groupId,
        ApiName: apiName,
        Visibility: conf.visibility || 'PUBLIC',
        Description: conf.description || 'The awesome api',
        AuthType: conf.auth_type || 'ANONYMOUS',
        RequestConfig: JSON.stringify({
            'RequestHttpMethod': method,
            'RequestProtocol': conf.requestProtocol || 'HTTP,HTTPS',
            'BodyFormat': conf.body_format || 'STREAM',
            'PostBodyDescription': '',
            'RequestPath': conf.path
        }),
        RequestParameters: JSON.stringify(requestParameters),
        ServiceParameters: JSON.stringify(serviceParameters),
        ServiceParametersMap: JSON.stringify(serviceParametersMap),
        ServiceConfig: JSON.stringify({
            'ServiceProtocol': 'FunctionCompute',
            'ContentTypeValue': 'application/json; charset=UTF-8',
            'Mock': 'FALSE',
            'MockResult': '',
            'ServiceTimeout': (conf.timeout || 3) * 1000,
            'ServiceAddress': '',
            'ServicePath': '',
            'ServiceHttpMethod': '',
            'ContentTypeCatagory': 'DEFAULT',
            'ServiceVpcEnable': 'FALSE',
            FunctionComputeConfig: {
                FcRegionId: fcRegion,
                ServiceName: serviceName,
                FunctionName: functionName,
                RoleArn: role.Role.Arn
            }
        }),
        ResultType: conf.resultType || 'PASSTHROUGH',
        ResultSample: conf.resultSample || 'result sample'
    };

    if (params.AuthType === 'OPENID') {
        const openidConf = conf.openid_connect_config || {};
        params.OpenIdConnectConfig = JSON.stringify({
            'IdTokenParamName': openidConf.id_token_param_name || 'token',
            'OpenIdApiType': openidConf.openid_api_type || 'BUSINESS',
            'PublicKeyId': openidConf.public_key_id,
            'PublicKey': openidConf.public_key
        });
    }

    if (!api) {
        await spinner({ indent: 4, text: `Create ${apiName} api` }, async () => {
            api = await ag.createApi(params);
        });
    } else {
        await spinner({ indent: 4, text: `Update ${apiName} api` }, async () => {
            await ag.modifyApi(Object.assign(params, {
                ApiId: api.ApiId
            }));
        });
    }

    return api;
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
        s.fail(error);
        throw error;
    }
}
