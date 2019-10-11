import { HookContext, customizer, BACKEND_TARGET, FRONTEND_TARGET } from '@malagu/cli';
import { ProfileProvider, Profile } from './profile-provider';
import { resolve, join, relative } from 'path';
import mergeWith = require('lodash.mergewith');
import { readdirSync, statSync, readFileSync, existsSync } from 'fs-extra';
const FCClient = require('@alicloud/fc2');
const OSSClient = require('ali-oss');
import  * as JSZip from 'jszip';
import * as ora from 'ora';
const CloudAPI = require('@alicloud/cloudapi');
const Ram = require('@alicloud/ram');
const chalk = require('chalk');

let client: any;
let ossClient: any;
let profile: Profile;
let frontendCodeDir: string;
let devAlias: string;
let prodAlias: string;

export default async (context: HookContext) => {
    const { pkg, configurations } = context;
    const defaultDeployConfig = {
        type: 'http',
        bucket: `malagu-${pkg.pkg.name}`,
        service: {
            name: 'malagu'
        },
        funciton: {
            name: pkg.pkg.name,
            handler: 'index.handler',
            memorySize: 128,
            runtime: 'nodejs10',
            initializer: 'index.init',
        },
        trigger: {
            name: pkg.pkg.name,
            triggerType: 'http',
            triggerConfig: {
                authType: 'anonymous',
                methods: ['GET', 'POST']
            }
        },
        apiGateway: {
            stage: 'RELEASE',
            group: {
                name: 'malagu'
            },
            api: {
                name: 'malagu',
                path: '/api'
            }
        },
        devAlias: 'dev',
        prodAlias: 'prod'

    };

    const appBackendConfig = pkg.backendConfig;
    const deployConfig = mergeWith(defaultDeployConfig, appBackendConfig.deployConfig, customizer);

    const profileProvider = new ProfileProvider();
    profile = deployConfig.profile ? <Profile>deployConfig.profile : await profileProvider.provide();

    devAlias = deployConfig.devAlias;
    prodAlias = deployConfig.prodAlias;

    for (const c of configurations) {
        if (c.name === FRONTEND_TARGET) {
            await deployFrontend(context, deployConfig);
        } else {
            await deployBackend(context, deployConfig);
        }
    }

};

async function deployFrontend(context: HookContext, deployConfig: any) {
    const { pkg, prod, dest } = context;
    frontendCodeDir = resolve(pkg.projectPath, dest, FRONTEND_TARGET);
    if (!existsSync(frontendCodeDir)) {
        console.log(chalk`{yellow Please build the project first with "malagu build"}`);
        return;
    }
    console.log(`Deploying ${chalk.yellow('frontend')} to Object Storage Service...`);
    const { bucket } = deployConfig;
    ossClient = new OSSClient({
        region: `oss-${profile.defaultRegion}`,
        accessKeyId: profile.accessKeyId,
        accessKeySecret: profile.accessKeySecret
    });
    await uploadFrontendCode(frontendCodeDir, bucket, new Date().toISOString());
    await uploadFrontendCode(frontendCodeDir, `${bucket}-${devAlias}`);
    if (prod) {
        await uploadFrontendCode(frontendCodeDir, `${bucket}-${prodAlias}`);
    }
    console.log('Deploy finished');
}

async function uploadFrontendCode(codeDir: string, bucket: string, prefix?: string) {
    try {
        await ossClient.getBucketInfo(bucket);
    } catch (error) {
        const s = ora(`Create ${bucket} bucket`).start();
        await ossClient.putBucket(bucket);
        await ossClient.putBucketACL(bucket, 'public-read');
        s.succeed();
    }

    ossClient.useBucket(bucket);
    const spinner = ora(`Upload to ${bucket} bucket`).start();
    await doUploadFrontendCode(codeDir, prefix);
    spinner.succeed();

    if (!prefix) {
        try {
            await ossClient.getBucketWebsite(bucket);
        } catch (error) {
            await ossClient.putBucketWebsite(bucket, {
                index: 'index.html'
            });
        }
        console.log(`    - Url: ${chalk.green.bold(`http://${bucket}.oss-${profile.defaultRegion}.aliyuncs.com`)}`);
    }

}

async function doUploadFrontendCode(codeDir: string, prefix: string = '') {
    const files = readdirSync(codeDir);
    await Promise.all(files.map(async fileName => {
        const fullPath = join(codeDir, fileName);
        const file = statSync(fullPath);
        if (file.isDirectory()) {
            await doUploadFrontendCode(fullPath, prefix);
        } else {
            await ossClient.put(join(prefix, relative(frontendCodeDir, fullPath)), fullPath);
        }
    }));
}

async function deployBackend(context: HookContext, deployConfig: any) {
    const { pkg, prod, dest } = context;
    const backendCodeDir = resolve(pkg.projectPath, dest, BACKEND_TARGET);
    if (!existsSync(backendCodeDir)) {
        console.log(chalk`{yellow Please build the project first with "malagu build"}`);
        return;
    }
    client = new FCClient(profile.accountId, {
        accessKeyID: profile.accessKeyId,
        accessKeySecret: profile.accessKeySecret,
        region: profile.defaultRegion,
        timeout: 600000
    });

    const { service, funciton, trigger, apiGateway, type } = deployConfig;
    const serviceName = service.name;
    const functionName = funciton.name;

    console.log(`Deploying ${chalk.yellow('backend')} to Function Compute...`);

    await createOrUpdateService(serviceName, service);

    const zip = new JSZip();
    await loadCode(backendCodeDir, zip);

    await createOrUpdateFunction(serviceName, functionName, funciton, zip);

    const { data: { versionId } } = await client.publishVersion(serviceName);

    await createOrUpdateAlias(serviceName, devAlias, versionId);

    if (prod) {
        await createOrUpdateAlias(serviceName, prodAlias, versionId);
    }

    if (type === 'http') {
        await createOrUpdateHttpTrigger(serviceName, functionName, trigger, devAlias);
        if (prod) {
            await createOrUpdateHttpTrigger(serviceName, functionName, trigger, prodAlias);
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
        const spinner = ora(`Update ${opt.triggerName} trigger`).start();
        await client.getTrigger(serviceName, functionName, opt.triggerName);
        await client.updateTrigger(serviceName, functionName, opt.triggerName, opt);
        spinner.succeed();

    } catch (ex) {
        if (ex.code === 'TriggerNotFound') {
            const spinner = ora(`Create ${opt.triggerName} trigger`).start();
            await client.createTrigger(serviceName, functionName, opt);
            spinner.succeed();
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
        const spinner = ora(`Update ${serviceName} service`).start();
        await client.getService(serviceName);
        await client.updateService(serviceName, option);
        spinner.succeed();
    } catch (ex) {
        if (ex.code === 'ServiceNotFound') {
            const spinner = ora(`Create a ${serviceName} service`).start();
            await client.createService(serviceName, option);
            spinner.succeed();
        } else {
            throw ex;
        }
    }
}

async function createOrUpdateFunction(serviceName: string, functionName: string, option: any, code: JSZip) {
    try {
        const spinner = ora(`Update ${functionName} function`).start();
        await client.getFunction(serviceName, functionName);
        await client.updateFunction(serviceName, functionName, {
            ...option,
            code: {
                zipFile: await code.generateAsync({type: 'base64', platform: 'UNIX'})
            },
        });
        spinner.succeed();

    } catch (ex) {
        if (ex.code === 'FunctionNotFound') {
            delete option.name;
            option.functionName = functionName;
            const spinner = ora(`Create ${functionName} function`).start();
            await client.createFunction(serviceName, {
                ...option,
                code: {
                    zipFile: await code.generateAsync({type: 'base64', platform: 'UNIX'})
                },
            });
            spinner.succeed();
        } else {
            throw ex;
        }
    }
}

async function createOrUpdateAlias(serviceName: string, aliasName: string, versionId: string) {
    try {
        const spinner = ora(`Update ${aliasName} alias to version ${versionId}`).start();
        await client.getAlias(serviceName, aliasName);
        await client.updateAlias(serviceName, aliasName, versionId);
        spinner.succeed();
    } catch (ex) {
        if (ex.code === 'AliasNotFound') {
            const spinner = ora(`Create ${aliasName} alias to version ${versionId}`).start();
            await client.createAlias(serviceName, aliasName, versionId);
            spinner.succeed();
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
            zip.file(fileName, readFileSync(fullPath));
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
        const spinner = ora({ indent: 4, text: `Create ${groupName} group` }).start();
        findGroup = await ag.createApiGroup({
            GroupName: groupName,
            Description: groupDescription
        }, { timeout: 10000 });
        spinner.succeed();
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
        const spinner = ora({ indent: 4, text: `Create ${roleName} role` }).start();
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
        spinner.succeed();
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
        const spinner = ora({ indent: 4, text: `Create ${apiName} api` }).start();
        api = await ag.createApi(params);
        spinner.succeed();
    } else {
        const spinner = ora({ indent: 4, text: `Update ${apiName} api` }).start();
        await ag.modifyApi(Object.assign(params, {
            ApiId: api.ApiId
        }));
        spinner.succeed();
    }

    return api;
}
