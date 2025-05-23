import { CliContext, PathUtil, ProjectUtil, SpinnerUtil } from '@celljs/cli-common';
import * as JSZip from 'jszip';
import * as delay from 'delay';
import { Lambda, ApiGatewayV2, IAM } from 'aws-sdk';
import { CloudUtils, DefaultProfileProvider } from '@celljs/cloud-plugin';
import { DefaultCodeLoader } from '@celljs/code-loader-plugin';
import { createClients, getAlias, getApi, getApiMapping, getCustomDomain, getFunction, getIntegration, getRoute, getStage, getTrigger } from './utils';
import { generateUUUID } from '@celljs/cli-common/lib/utils/uuid';

const chalk = require('chalk');
const camelcaseKeys = require('camelcase-keys');

let lambdaClient: Lambda;
let apiGatewayClient: ApiGatewayV2;
let iamClient: IAM;
let projectId: string;

export default async (context: CliContext) => {
    const { cfg, pkg } = context;

    const cloudConfig = CloudUtils.getConfiguration(cfg);

    const profileProvider = new DefaultProfileProvider();
    const { region, account, credentials } = await profileProvider.provide(cloudConfig);

    const clients = await createClients(region, credentials);
    lambdaClient = clients.lambdaClient;
    apiGatewayClient = clients.apiGatewayClient;
    iamClient = clients.iamClient;

    const { apiGateway, alias, trigger, disableProjectId } = cloudConfig;
    const functionMeta = cloudConfig.function;
    const accountId = account.id;

    console.log(`\nDeploying ${chalk.bold.yellow(pkg.pkg.name)} to the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);
    console.log(chalk`{bold.cyan - Profile: }`);
    console.log(`    - AccountId: ${account?.id}`);
    console.log(`    - Region: ${region}`);

    console.log(chalk`{bold.cyan - Lambda:}`);

    await createOrUpdateFunction(functionMeta, accountId, region, disableProjectId);

    const functionVersion = await publishVersion(functionMeta.name);

    await createOrUpdateAlias(alias, functionMeta.name, functionVersion);

    if (trigger) {
        await createTrigger(trigger, functionMeta.name);
    }

    if (apiGateway) {
        console.log(chalk`\n{bold.cyan - API Gateway:}`);
        const { customDomain, api, integration, route, stage } = apiGateway;
        api.name = disableProjectId ? api.name : `${api.name}_${projectId}`;
        const { ApiId, ApiEndpoint } = await createOrUpdateApi(api, functionMeta.name, alias.name, region, accountId);
        integration.integrationUri = `arn:aws:lambda:${region}:${accountId}:function:${functionMeta.name}:${alias.name}`;
        const prev = await createOrUpdateIntegration(integration, ApiId!);
        await createOrUpdateRoute(route, ApiId!, prev.IntegrationId!);
        await createOrUpdateStage(stage, ApiId!);
        console.log(chalk`    - Url: {green.bold ${ApiEndpoint}/${stage.name}/}`);

        if (customDomain?.name) {
            const { apiMapping } = customDomain;
            await bindOrUpdateCustomDomain(customDomain, ApiEndpoint || '');
            if (apiMapping) {
                await createOrUpdateApiMapping(apiMapping, customDomain.name, ApiId!, stage.name);
            }
        }

    }
    console.log();
};

async function createTrigger(trigger: any, functionName: string) {

    const oldEventSourceMapping = await getTrigger(lambdaClient, functionName, trigger.eventSourceArn);
    if (oldEventSourceMapping) {
        const deleteEventSourceMappingRequest: Lambda.Types.DeleteEventSourceMappingRequest = {
            UUID: oldEventSourceMapping.UUID!
        };
        await lambdaClient.deleteEventSourceMapping(deleteEventSourceMappingRequest).promise();

    }
    const createEventSourceMappingRequest: Lambda.Types.CreateEventSourceMappingRequest = camelcaseKeys(trigger, { pascalCase: true });

    await SpinnerUtil.start(`Set a ${trigger.name} Trigger`, async () => {
        await lambdaClient.createEventSourceMapping(createEventSourceMappingRequest).promise();
    });
}

function parseUpdateFunctionConfigurationRequest(functionMeta: any) {

    const req: Lambda.Types.UpdateFunctionConfigurationRequest = {
        FunctionName: functionMeta.name,
        Description: functionMeta.description,
        Runtime: functionMeta.runtime,
        Timeout: functionMeta.timeout,
        Role: functionMeta.role,
        Handler: functionMeta.handler,
        KMSKeyArn: functionMeta.kmsKeyArn,
        MemorySize: functionMeta.memorySize,
        RevisionId: functionMeta.revisionId,
        Layers: functionMeta.layers
    };

    const { deadLetterConfig, environment, fileSystemConfigs, imageConfig, vpcConfig, tracingConfig, } = functionMeta;
    if (environment) {
            req.Environment = {
            Variables: environment.variables
        };
    }

    if (vpcConfig) {
        req.VpcConfig = {
            SecurityGroupIds: vpcConfig.securityGroupIds,
            SubnetIds: vpcConfig.subnetIds
        };
    }

    if (deadLetterConfig) {
        req.DeadLetterConfig = {
            TargetArn: deadLetterConfig.targetArn
        };
    }

    if (imageConfig) {
        req.ImageConfig = {
            Command: imageConfig.command,
            EntryPoint: imageConfig.entryPoint,
            WorkingDirectory: imageConfig.workingDirectory
        };
    }

    if (tracingConfig) {
        req.TracingConfig = {
            Mode: tracingConfig.mode
        };
    }

    if (fileSystemConfigs) {
        req.FileSystemConfigs = [];
        for (const fileSystemConfig of fileSystemConfigs) {
            req.FileSystemConfigs.push({
                Arn: fileSystemConfig.arn,
                LocalMountPath: fileSystemConfig.localMountPath
            });
        }
    }
    return req;
}

async function parseCreateFunctionRequest(functionMeta: any) {
    const config = parseUpdateFunctionConfigurationRequest(functionMeta);
    delete config.RevisionId;

    const req: Lambda.Types.CreateFunctionRequest = {
        ...config,
        Role: functionMeta.role,
        CodeSigningConfigArn: functionMeta.codeSigningConfigArn,
        PackageType: functionMeta.packageType,
        Publish: functionMeta.publish,
        Tags: functionMeta.tags,
        Code: await parseFunctionCode(functionMeta)
    };
    return req;
}

async function tryCreateProjectId(functionName: string) {
    projectId = await ProjectUtil.createProjectId();
    const functionInfo = await getFunction(lambdaClient, `${functionName}_${projectId}`);
    if (functionInfo) {
        await tryCreateProjectId(functionName);
    }
}

async function parseFunctionCode(functionMeta: any) {
    const s3Uri = CloudUtils.parseS3Uri(functionMeta.codeUri);
    let code: JSZip | undefined;
    if (!s3Uri) {
        const codeLoader = new DefaultCodeLoader();
        code = await codeLoader.load(PathUtil.getProjectDistPath(), functionMeta.codeUri);
    }

    if (s3Uri) {
        return {
            S3Bucket: s3Uri.bucket,
            S3Key: s3Uri.key,
            S3ObjectVersion: s3Uri.version
        };
    } else {
        return { ZipFile: await code!.generateAsync({ type: 'arraybuffer', platform: 'UNIX', compression: 'DEFLATE'  }) };
    }
}

async function createOrUpdateFunction(functionMeta: any, accountId: string, region: string, disableProjectId: boolean) {
    projectId = await ProjectUtil.getProjectId();
    let functionInfo: any;
    if (disableProjectId) {
        functionInfo = await getFunction(lambdaClient, functionMeta.name);
    } else {
        if (!projectId) {
            await tryCreateProjectId(functionMeta.name);
            await ProjectUtil.saveProjectId(projectId);
            functionMeta.name = `${functionMeta.name}_${projectId}`;
        } else {
            functionMeta.name = `${functionMeta.name}_${projectId}`;
            functionInfo = await getFunction(lambdaClient, functionMeta.name);
        }
    }

    await createRoleIfNeed(functionMeta, accountId, region);

    if (functionInfo) {
        await SpinnerUtil.start(`Update ${functionMeta.name} function${functionMeta.sync === 'onlyUpdateCode' ? ' (only update code)' : ''}`, async () => {
            const updateFunctionCodeRequest: Lambda.Types.UpdateFunctionCodeRequest = {
                FunctionName: functionMeta.name,
                ...await parseFunctionCode(functionMeta)
            };
            await lambdaClient.updateFunctionCode(updateFunctionCodeRequest).promise();

            await checkStatus(functionMeta.name);

            if (functionMeta.sync !== 'onlyUpdateCode') {
                const updateConfig = parseUpdateFunctionConfigurationRequest(functionMeta);
                delete updateConfig.Runtime;

                functionInfo = await lambdaClient.updateFunctionConfiguration(updateConfig).promise();
            }
        });
    } else {
        functionInfo = await SpinnerUtil.start(`Create ${functionMeta.name} function`, async () => createFunctionWithRetry(functionMeta));
    }
}

async function createRoleIfNeed(functionMeta: any, accountId: string, region: string) {
    if (!functionMeta.role) {
        const roleName = `${functionMeta.name}-role`;
        try {
            const { Role } = await iamClient.getRole({ RoleName: roleName }).promise();
            functionMeta.role = Role.Arn;
        } catch (error) {
            if (error.statusCode === 404) {
                await SpinnerUtil.start(`Create ${roleName} role`, async () => {
                    const { Role } = await iamClient.createRole({
                        RoleName: roleName,
                        AssumeRolePolicyDocument: JSON.stringify({
                            Version: '2012-10-17',
                            Statement: {
                                Effect: 'Allow',
                                Principal: { Service: 'lambda.amazonaws.com' },
                                Action: 'sts:AssumeRole'
                            }
                        })
                    }).promise();
                    const policyName = `AWSLambdaBasicExecutionRole-${generateUUUID()}`;
                    const { Policy } = await iamClient.createPolicy({
                        PolicyName: policyName,
                        PolicyDocument: JSON.stringify({
                            Version: '2012-10-17',
                            Statement: [
                                {
                                    Effect: 'Allow',
                                    Action: 'logs:CreateLogGroup',
                                    Resource: `arn:aws:logs:${region}:${accountId}:*`
                                },
                                {
                                    Effect: 'Allow',
                                    Action: [
                                        'logs:CreateLogStream',
                                        'logs:PutLogEvents'
                                    ],
                                    Resource: [
                                        `arn:aws:logs:${region}:${accountId}:log-group:/aws/lambda/${functionMeta.name}:*`
                                    ]
                                }
                            ]
                        }
                    )}).promise();
                    await iamClient.attachRolePolicy({ RoleName: roleName, PolicyArn: Policy?.Arn ?? '' }).promise();
                    await new Promise<void>(r =>  {
                        setTimeout(() => {
                            r();
                        }, 5000);
                    });
                    functionMeta.role = Role.Arn;
                });
            } else {
                throw error;
            }
        }
    }
}

async function publishVersion(functionName: string) {
    const { functionVersion } = await SpinnerUtil.start('Publish version', async () => {
        await checkStatus(functionName);
        const { Version } = await lambdaClient.publishVersion({ FunctionName: functionName }).promise();
        return {
            functionVersion: Version,
            successText: `Publish version ${Version}`
        };
    });
    return functionVersion;
}

function parseCreateAliasRequest(aliasMeta: any, functionName: string, functionVersion: string) {
    const req: Lambda.Types.CreateAliasRequest = <Lambda.Types.CreateAliasRequest>{
        ...parseUpdateAliasRequest(aliasMeta, functionName, functionVersion)
    };
    return req;
}

function parseUpdateAliasRequest(aliasMeta: any, functionName: string, functionVersion: string) {
    const req: Lambda.Types.UpdateAliasRequest = {
        Name: aliasMeta.name,
        FunctionName: functionName,
        Description: aliasMeta.description,
        FunctionVersion: functionVersion
    };

    const { routingConfig } = aliasMeta;
    if (routingConfig) {
        req.RoutingConfig = {
            AdditionalVersionWeights: routingConfig.additionalVersionWeights
        };
    }
    return req;
}

async function createOrUpdateAlias(alias: any, functionName: string, functionVersion: string) {
    const aliasInfo = await getAlias(lambdaClient, functionName, alias.name);
    if (aliasInfo) {
        await SpinnerUtil.start(`Update ${alias.name} alias to version ${functionVersion}`, async () => {
            await checkStatus(functionName);
            await lambdaClient.updateAlias(parseUpdateAliasRequest(alias, functionName, functionVersion)).promise();
        });
    } else {
        await SpinnerUtil.start(`Create ${alias.name} alias to version ${functionVersion}`, async () => {
            await checkStatus(functionName);
            await lambdaClient.createAlias(parseCreateAliasRequest(alias, functionName, functionVersion)).promise();
        });
    }
}

function parseCreateApiRequest(apiMeta: any) {
    const req: ApiGatewayV2.CreateApiRequest = {
        Name: apiMeta.name,
        ProtocolType: apiMeta.protocolType,
        Description: apiMeta.description,
        ApiKeySelectionExpression: apiMeta.apiKeySelectionExpression,
        CredentialsArn: apiMeta.credentialsArn,
        DisableExecuteApiEndpoint: apiMeta.disableExecuteApiEndpoint,
        DisableSchemaValidation: apiMeta.disableSchemaValidation,
        RouteKey: apiMeta.routeKey,
        RouteSelectionExpression: apiMeta.routeSelectionExpression,
        Tags: apiMeta.tags,
        Target: apiMeta.target,
        Version: apiMeta.version
    };

    const { corsConfiguration } = apiMeta;

    if (corsConfiguration) {
        req.CorsConfiguration = {
            AllowCredentials: corsConfiguration.allowCredentials,
            AllowHeaders: corsConfiguration.allowHeaders,
            AllowMethods: corsConfiguration.allowMethods,
            AllowOrigins: corsConfiguration.allowOrigins,
            ExposeHeaders: corsConfiguration.exposeHeaders,
            MaxAge: corsConfiguration.maxAge
        };
    }
    return req;

}

function parseUpdateApiRequest(apiMeta: any, apiId: string) {
    const createApiRequest: any = parseCreateApiRequest(apiMeta);
    delete createApiRequest.ProtocolType;
    delete createApiRequest.Tags;

    const req: ApiGatewayV2.UpdateApiRequest = {
        ...createApiRequest,
        ApiId: apiId
    };
    return req;

}

function parseCreateIntegrationRequest(integrationMeta: any, apiId: string) {
    const req: ApiGatewayV2.CreateIntegrationRequest = {
        ApiId: apiId,
        IntegrationType: integrationMeta.integrationType,
        ConnectionId: integrationMeta.connectionId,
        ConnectionType: integrationMeta.connectionType,
        ContentHandlingStrategy: integrationMeta.contentHandlingStrategy,
        CredentialsArn: integrationMeta.credentialsArn,
        Description: integrationMeta.description,
        IntegrationMethod: integrationMeta.integrationMethod,
        IntegrationSubtype: integrationMeta.integrationSubtype,
        IntegrationUri: integrationMeta.integrationUri,
        PassthroughBehavior: integrationMeta.passthroughBehavior,
        PayloadFormatVersion: integrationMeta.payloadFormatVersion,
        RequestParameters: integrationMeta.requestParameters,
        RequestTemplates: integrationMeta.requestTemplates,
        TemplateSelectionExpression: integrationMeta.templateSelectionExpression,
        TimeoutInMillis: integrationMeta.timeoutInMillis
    };

    const { tlsConfig } = integrationMeta;

    if (tlsConfig) {
        req.TlsConfig = {
            ServerNameToVerify: tlsConfig.serverNameToVerify
        };
    }
    return req;

}

function parseUpdateIntegrationRequest(integrationMeta: any, apiId: string, integrationId: string) {
    const req: ApiGatewayV2.UpdateIntegrationRequest = {
        ...parseCreateIntegrationRequest(integrationMeta, apiId),
        ApiId: apiId,
        IntegrationId: integrationId,
    };
    return req;

}

async function createOrUpdateApi(api: any, functionName: string, aliasName: string, region: string, accountId: string) {
    const apiName = api.name;
    const apiInfo = await getApi(apiGatewayClient, apiName);
    let result: ApiGatewayV2.UpdateApiResponse | ApiGatewayV2.CreateApiResponse;
    if (apiInfo) {
        result = await SpinnerUtil.start(`Update ${apiName} api`, async () => {
            const apiId = apiInfo.ApiId!;
            return apiGatewayClient.updateApi(parseUpdateApiRequest(api, apiId)).promise();
        });
    } else {
        result = await SpinnerUtil.start(`Create ${apiName} api`, () => apiGatewayClient.createApi(parseCreateApiRequest(api)).promise());
        await lambdaClient.addPermission({
            FunctionName:  `arn:aws:lambda:${region}:${accountId}:function:${functionName}:${aliasName}`,
            StatementId: generateUUUID(),
            Action: 'lambda:InvokeFunction',
            Principal: 'apigateway.amazonaws.com',
            SourceArn: `arn:aws:execute-api:${region}:${accountId}:${result.ApiId}/*/*/*`
        }).promise();
    }

    return result;
}

async function createOrUpdateIntegration(integrationMeta: any, apiId: string) {
    const integrationInfo = await getIntegration(apiGatewayClient, apiId);
    let result: ApiGatewayV2.UpdateIntegrationResult | ApiGatewayV2.CreateIntegrationResult;
    if (integrationInfo) {
        const integrationId = integrationInfo.IntegrationId!;
        await SpinnerUtil.start(`Update ${integrationId} integration`, async () => {
            result = await apiGatewayClient.updateIntegration(parseUpdateIntegrationRequest(integrationMeta, apiId, integrationId)).promise();

        });
    } else {
        await SpinnerUtil.start('Create integration', async () => {
            result = await apiGatewayClient.createIntegration(parseCreateIntegrationRequest(integrationMeta, apiId)).promise();
        });
    }

    return result!;
}

function parseCreateRouteRequest(routeMeta: any, apiId: string, integrationId: string) {
    const req: ApiGatewayV2.CreateRouteRequest = {
        ApiId: apiId,
        ApiKeyRequired: routeMeta.apiKeyRequired,
        AuthorizationScopes: routeMeta.authorizationScopes,
        AuthorizationType: routeMeta.authorizationType,
        AuthorizerId: routeMeta.authorizerId,
        ModelSelectionExpression: routeMeta.modelSelectionExpression,
        OperationName: routeMeta.operationName,
        RequestModels: routeMeta.requestModels,
        RequestParameters: routeMeta.requestParameters,
        RouteKey: routeMeta.routeKey,
        RouteResponseSelectionExpression: routeMeta.routeResponseSelectionExpression,
        Target: `integrations/${integrationId}`

    };
    return req;

}

function parseUpdateRouteRequest(routeMeta: any, apiId: string, integrationId: string, routeId: string) {
    const req: ApiGatewayV2.UpdateRouteRequest = {
        ...parseCreateRouteRequest(routeMeta, apiId, integrationId),
        ApiId: apiId,
        RouteId: routeId
    };
    return req;

}

async function createOrUpdateRoute(routeMeta: any, apiId: string, integrationId: string) {
    const routeInfo = await getRoute(apiGatewayClient, apiId);
    let result: ApiGatewayV2.UpdateRouteResult | ApiGatewayV2.CreateRouteResult;
    if (routeInfo) {
        const routeId = routeInfo.RouteId!;
        await SpinnerUtil.start(`Update route: ${routeMeta.routeKey}`, async () => {
            result = await apiGatewayClient.updateRoute(parseUpdateRouteRequest(routeMeta, apiId, integrationId, routeId)).promise();
        });
    } else {
        await SpinnerUtil.start(`Create route: ${routeMeta.routeKey}`, async () => {
            result = await apiGatewayClient.createRoute(parseCreateRouteRequest(routeMeta, apiId, integrationId)).promise();
        });
    }

    return result!;
}

function parseUpdateDomainNameRequest(customDomainMeta: any, apiEndpoint: string) {
    const req: ApiGatewayV2.UpdateDomainNameRequest = {
        DomainName: customDomainMeta.name
    };

    const { domainNameConfigurations, mutualTlsAuthentication } = customDomainMeta;

    if (domainNameConfigurations) {
        req.DomainNameConfigurations = [];
        for (const config of domainNameConfigurations) {
            req.DomainNameConfigurations.push({
                ApiGatewayDomainName: config.ApiGatewayDomainName || apiEndpoint.replace('https://', ''),
                CertificateArn: config.certificateArn,
                CertificateName: config.certificateName,
                DomainNameStatus: config.domainNameStatus,
                CertificateUploadDate: config.certificateUploadDate,
                DomainNameStatusMessage: config.domainNameStatusMessage,
                EndpointType: config.endpointType,
                HostedZoneId: config.hostedZoneId,
                SecurityPolicy: config.SecurityPolicy
            });

        }
    }

    if (mutualTlsAuthentication) {
        req.MutualTlsAuthentication = {
            TruststoreUri: mutualTlsAuthentication.truststoreUri,
            TruststoreVersion: mutualTlsAuthentication.truststoreVersion
        };
    }

    return req;
}

function parseCreateDomainNameRequest(customDomainMeta: any, apiEndpoint: string) {
    const req: ApiGatewayV2.CreateDomainNameRequest = {
        ...parseUpdateDomainNameRequest(customDomainMeta, apiEndpoint),
    };
    return req;

}

async function bindOrUpdateCustomDomain(customDomain: any, apiEndpoint: string) {
    const customDomainInfo = await getCustomDomain(apiGatewayClient, customDomain.name);
    if (customDomainInfo) {
        await SpinnerUtil.start(`Update ${customDomain.name} customDomain`, async () => {
            await apiGatewayClient.updateDomainName(parseUpdateDomainNameRequest(customDomain, apiEndpoint)).promise();
        });
    } else {
        await SpinnerUtil.start(`Create ${customDomain.name} customDomain`, async () => {
            await apiGatewayClient.createDomainName(parseCreateDomainNameRequest(customDomain, apiEndpoint)).promise();
        });
    }
}

function parseCreateApiMappingRequest(apiMappingMeta: any, domainName: string, apiId: string, stageName: string) {
    const req: ApiGatewayV2.CreateApiMappingRequest = {
        ApiId: apiId,
        Stage: stageName,
        DomainName: domainName,
        ApiMappingKey: apiMappingMeta.apiMappingKey
    };
    return req;
}

function parseUpdateApiMappingRequest(apiMappingMeta: any, domainName: string, apiId: string, stageName: string, apiMappingId: string) {
    const req: ApiGatewayV2.UpdateApiMappingRequest = {
        ...parseCreateApiMappingRequest(apiMappingMeta, domainName, apiId, stageName),
        ApiMappingId: apiMappingId,
    };
    return req;
}

async function createOrUpdateApiMapping(apiMapping: any, domainName: string, apiId: string, stageName: string) {
    const apiMappingInfo = await getApiMapping(apiGatewayClient, domainName, apiId, stageName);
    if (apiMappingInfo) {
        const apiMappingId = apiMappingInfo.ApiMappingId!;
        await SpinnerUtil.start(`Update ${apiMappingId} api mapping  for ${domainName}`, async () => {
            await apiGatewayClient.updateApiMapping(parseUpdateApiMappingRequest(apiMapping, domainName, apiId, stageName, apiMappingId)).promise();
        });
    } else {
        await SpinnerUtil.start(`Create api mapping for ${domainName}`, async () => {
            await apiGatewayClient.createApiMapping(parseCreateApiMappingRequest(apiMapping, domainName, apiId, stageName)).promise();
        });
    }
    console.log(chalk`    - Url: ${chalk.green.bold(`https://${domainName}/${apiMapping.apiMappingKey?.split('*')[0]}`)}`);

}

function parseUpdateStageRequest(stageMeta: any, apiId: string, deploymentId?: string) {
    const req: ApiGatewayV2.UpdateStageRequest = {
        StageName: stageMeta.name,
        ApiId: apiId,
        ClientCertificateId: stageMeta.clientCertificateId,
        AutoDeploy: stageMeta.autoDeploy,
        DeploymentId: deploymentId,
        RouteSettings: stageMeta.routeSettings,
        Description: stageMeta.description,
        StageVariables: stageMeta.stageVariables
    };

    const { defaultRouteSettings, accessLogSettings } = stageMeta;
    if (defaultRouteSettings) {
        req.DefaultRouteSettings = {
            DataTraceEnabled: defaultRouteSettings.dataTraceEnabled,
            DetailedMetricsEnabled: defaultRouteSettings.detailedMetricsEnabled,
            LoggingLevel: defaultRouteSettings.loggingLevel,
            ThrottlingBurstLimit: defaultRouteSettings.throttlingBurstLimit,
            ThrottlingRateLimit: defaultRouteSettings.throttlingRateLimit,
        };
    }

    if (accessLogSettings) {
        req.AccessLogSettings = {
            DestinationArn: accessLogSettings.destinationArn,
            Format: accessLogSettings.format
        };
    }
    return req;
}

function parseCreateStageRequest(stageMeta: any, apiId: string, deploymentId?: string) {
    const req: ApiGatewayV2.CreateStageRequest = {
        ...parseUpdateStageRequest(stageMeta, apiId, deploymentId)
    };
    return req;

}

async function createOrUpdateStage(stage: any, apiId: string) {
    const stageInfo = await getStage(apiGatewayClient, apiId, stage.name);
    if (stageInfo) {
        await SpinnerUtil.start(chalk`Update {yellow.bold ${stage.name}} stage`, async () => {
            const { DeploymentId } = await createDeployment(apiId, stage.name);
            await apiGatewayClient.updateStage(parseUpdateStageRequest(stage, apiId, DeploymentId)).promise();
        });
    } else {
        await SpinnerUtil.start(chalk`Create {yellow.bold ${stage.name}} stage`, async () => {
            await apiGatewayClient.createStage(parseCreateStageRequest(stage, apiId)).promise();
            const { DeploymentId } = await createDeployment(apiId, stage.name);
            await apiGatewayClient.updateStage(parseUpdateStageRequest(stage, apiId, DeploymentId)).promise();
        });
    }
}

async function createDeployment(apiId: string, stageName: string) {
    return apiGatewayClient.createDeployment({ ApiId: apiId, StageName: stageName }).promise();
}

async function checkStatus(functionName: string) {
    let state = 'Pending';
    let times = 200;
    while ((state !== 'Active') && times > 0) {
        const tempFunc = await getFunction(lambdaClient, functionName);
        state = tempFunc?.Configuration?.State ?? '';
        await delay(500);
        times = times - 1;
    }
    if (state !== 'Active') {
        throw new Error(`Please check function status: ${functionName}`);
    }
}

// / This error happens when the role is invalid (which is not the case) or when you try to create the Lambda function just after the role creation.
// / Amazon needs a few seconds to replicate your new role through all regions.
// / view detail: `https://stackoverflow.com/questions/37503075/invalidparametervalueexception-the-role-defined-for-the-function-cannot-be-assu`
async function createFunctionWithRetry(functionMeta: any) {
    let times = 10;
    while (times > 0) {
        try {
            return await lambdaClient.createFunction(await parseCreateFunctionRequest(functionMeta)).promise();
        } catch (err) {
            if (err.code !== 'InvalidParameterValueException') {
                throw err;
            }
        }
        await delay(1500);
        times = times - 1;
    }
    throw new Error('Please try again later');
}

