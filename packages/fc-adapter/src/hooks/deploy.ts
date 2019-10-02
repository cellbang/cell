import { HookContext, customizer } from '@malagu/cli';
import { ProfileProvider, Profile } from './profile-provider';
import { resolve, join } from 'path';
import mergeWith = require('lodash.mergewith');
import { readdirSync, statSync, readFileSync } from 'fs-extra';
const FCClient = require('@alicloud/fc2');
import  * as JSZip from 'jszip';
const CloudAPI = require('@alicloud/cloudapi');
const Ram = require('@alicloud/ram');

export default async (context: HookContext) => {
    const { pkg } = context;
    const defaultDeployConfig = {
        type: 'http',
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
        }

    };

    const appBackendConfig = pkg.backendConfig;
    const deployConfig = mergeWith(defaultDeployConfig, appBackendConfig.deployConfig, customizer);
    const profileProvider = new ProfileProvider();
    const profile = deployConfig.profile ? <Profile>deployConfig.profile : await profileProvider.provide();
    const client = new FCClient(profile.accountId, {
        accessKeyID: profile.accessKeyId,
        accessKeySecret: profile.accessKeySecret,
        region: profile.defaultRegion,
        timeout: 60000
    });

    const { service, funciton, trigger, apiGateway, type } = deployConfig;
    const serviceName = service.name;
    const functionName = funciton.name;

    console.log(`Deploying ${profile.defaultRegion}/${serviceName}/${functionName} to function compute...`);

    try {
        delete service.name;
        await client.getService(serviceName);
        await client.updateService(serviceName, service);
        console.log(`- Update ${serviceName} service`);
    } catch (ex) {
        if (ex.code === 'ServiceNotFound') {
            await client.createService(serviceName, service);
            console.log(`- Create a ${serviceName} service`);
        } else {
            throw ex;
        }
    }

    const zip = new JSZip();
    await loadCode(resolve(pkg.projectPath, 'dist', 'backend'), zip);

    try {
        await client.getFunction(serviceName, functionName);
        await client.updateFunction(serviceName, functionName, {
            ...funciton,
            code: {
                zipFile: await zip.generateAsync({type: 'base64', platform: 'UNIX'})
            },
        });
        console.log(`- Update ${functionName} function`);
    } catch (ex) {
        if (ex.code === 'FunctionNotFound') {
            delete funciton.name;
            funciton.functionName = functionName;
            await client.createFunction(serviceName, {
                ...funciton,
                code: {
                    zipFile: await zip.generateAsync({type: 'base64', platform: 'UNIX'})
                },
            });
            console.log(`- Create ${functionName} function`);
        } else {
            throw ex;
        }
    }

    if (type === 'http') {
        const triggerName = trigger.name;

        try {
            delete trigger.name;
            trigger.triggerName = triggerName;
            await client.getTrigger(serviceName, functionName, triggerName);
            await client.updateTrigger(serviceName, functionName, triggerName, trigger);
            console.log(`- Update ${triggerName} trigger`);
        } catch (ex) {
            if (ex.code === 'TriggerNotFound') {
                await client.createTrigger(serviceName, functionName, trigger);
                console.log(`- Create a ${triggerName} trigger`);
            } else {
                throw ex;
            }
        }
        console.log(`    - Methods: ${trigger.triggerConfig.methods}`);
        console.log(`    - Url: https://${profile.accountId}.${profile.defaultRegion}.fc.aliyuncs.com/2016-08-15/proxy/${serviceName}/${functionName}/`);
    }

    if (type === 'api-gateway') {
        console.log('- API Gateway:');
        const { group, api, stage } = apiGateway;
        api['function'] = `${profile.defaultRegion}/${serviceName}/${functionName}`;
        const ag = new CloudAPI({
            accessKeyId: profile.accessKeyId,
            accessKeySecret: profile.accessKeySecret,
            endpoint: `http://apigateway.${profile.defaultRegion}.aliyuncs.com`,
        });

        const ram = new Ram({
            accessKeyId: profile.accessKeyId,
            accessKeySecret: profile.accessKeySecret,
            endpoint: 'https://ram.aliyuncs.com'
        });

        const role = await createRoleIfNeed(ram, 'apigatewayAccessFC');

        const apiGroup = await createGroupIfNeed(ag, group);
        const _api = await createOrUpdateAPI(ag, apiGroup, api, role);

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
    console.log('Deploy finished');

};

async function loadCode(codeDir: string, zip: JSZip) {
    const files = readdirSync(codeDir);
    await Promise.all(files.map(async fileName => {
        const fillPath = join(codeDir, fileName);
        const file = statSync(fillPath);
        if (file.isDirectory()) {
            const dir = zip.folder(fileName);
            await loadCode(fillPath, dir);
        } else {
            zip.file(fileName, readFileSync(fillPath));
        }
    }));
}

async function createGroupIfNeed(ag: any, group: any) {
    const groupName = group.name;
    const groupDescription = group.description;

    const groups = await ag.describeApiGroups({
        GroupName: groupName // filter out
    }, { timeout: 10000 });

    const list = groups.ApiGroupAttributes.ApiGroupAttribute;
    let findGroup = list.find((item: any) => item.GroupName === groupName);

    if (!findGroup) {
        findGroup = await ag.createApiGroup({
            GroupName: groupName,
            Description: groupDescription
        }, { timeout: 10000 });
        console.log(`    - Create ${groupName} group`);
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
        console.log(`    - Create ${roleName} role`);
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
        api = await ag.createApi(params);
        console.log(`    - Create ${apiName} api`);
    } else {
        await ag.modifyApi(Object.assign(params, {
            ApiId: api.ApiId
        }));
        console.log(`    - Update ${apiName} api`);
    }

    return api;
}
