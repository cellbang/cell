import { DeployContext } from '@malagu/cli-service';
import * as JSZip from 'jszip';
import * as ora from 'ora';
import * as delay from 'delay';
import { v4 } from 'uuid';

import { Lambda, ApiGatewayV2, IAM } from 'aws-sdk';
import { Credentials } from '@malagu/cloud';
import { DefaultCodeLoader, FaaSAdapterUtils, DefaultProfileProvider } from '@malagu/faas-adapter/lib/hooks';

const chalk = require('chalk');

let lambdaClient: Lambda;
let apiGatewayClient: ApiGatewayV2;
let iamClient: IAM;

export default async (context: DeployContext) => {
    const { cfg, pkg } = context;

    const adapterConfig = FaaSAdapterUtils.getConfiguration<any>(cfg);

    const profileProvider = new DefaultProfileProvider();
    const { region, account, credentials } = await profileProvider.provide(adapterConfig);
    await createClients(region, credentials);

    const { apiGateway, customDomain, alias, type } = adapterConfig;
    const functionMeta = adapterConfig.function;
    const functionName = functionMeta.name;
    const accountId = account.id;

    console.log(`\nDeploying ${chalk.bold.yellow(pkg.pkg.name)} to the ${chalk.bold.blue(region)} region of Lambda...`);
    console.log(chalk`{bold.cyan - Lambda:}`);

    await createRoleIfNeed(functionMeta, accountId, region);

    const codeLoader = new DefaultCodeLoader();
    const zip = await codeLoader.load(context, adapterConfig);
    await createOrUpdateFunction(functionMeta, zip);

    const functionVersion = await publishVersion(functionName);

    await createOrUpdateAlias(alias, functionVersion);

    if (type === 'api-gateway') {
        console.log(chalk`\n{bold.cyan - API Gateway:}`);
        const { apiMapping, api, integration, route, stage } = apiGateway;
        const { ApiId, ApiEndpoint } = await createOrUpdateApi(api, functionName, region, accountId);
        integration.integrationUri = `arn:aws:lambda:${region}:${accountId}:function:${functionName}:${stage.name}`;
        const prev = await createOrUpdateIntegration(integration, ApiId!);
        await createOrUpdateRoute(route, ApiId!, prev.IntegrationId!);
        await createOrUpdateStage(stage, ApiId!);
        console.log(chalk`    - Url: {green.bold ${ApiEndpoint}/${stage.name}/}`);

        if (customDomain.name) {
            await bindOrUpdateCustomDomain(customDomain);
            await createOrUpdateApiMapping(apiMapping, customDomain.name, ApiId!, stage.name);
        }

    }
    console.log('Deploy finished');
    console.log();
};

async function createClients(region: string, credentials: Credentials) {
    const clientConfig = {
        region,
        credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.accessKeySecret,
            sessionToken: credentials.token
        }
    };
    lambdaClient = new Lambda(clientConfig);
    apiGatewayClient = new ApiGatewayV2(clientConfig);
    iamClient = new IAM(clientConfig);
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

function parseCreateFunctionRequest(functionMeta: any, code: ArrayBuffer) {
    const config = parseUpdateFunctionConfigurationRequest(functionMeta);
    delete config.RevisionId;

    const req: Lambda.Types.CreateFunctionRequest = {
        ...config,
        Role: functionMeta.role,
        CodeSigningConfigArn: functionMeta.codeSigningConfigArn,
        PackageType: functionMeta.packageType,
        Publish: functionMeta.publish,
        Tags: functionMeta.tags,
        Code: {
            ZipFile: code
        }
    };
    return req;
}

function getFunction(functionName: string) {
    return lambdaClient.getFunction({ FunctionName: functionName }).promise();
}

async function createOrUpdateFunction(functionMeta: any, code: JSZip) {

    try {
        await getFunction(functionMeta.name);
        await spinner(`Update ${functionMeta.name} function`, async () => {
            const updateFunctionCodeRequest: Lambda.Types.UpdateFunctionCodeRequest = {
                FunctionName: functionMeta.name,
                ZipFile: await code.generateAsync({ type: 'arraybuffer', platform: 'UNIX' })
            };
            await lambdaClient.updateFunctionCode(updateFunctionCodeRequest).promise();

            await checkStatus(functionMeta.name);

            await lambdaClient.updateFunctionConfiguration(parseUpdateFunctionConfigurationRequest(functionMeta)).promise();
        });
    } catch (error) {
        if (error.statusCode === 404) {
            await spinner(`Create ${functionMeta.name} function`, async () => {
                await lambdaClient.createFunction(parseCreateFunctionRequest(functionMeta, await code.generateAsync({ type: 'arraybuffer', platform: 'UNIX' }))).promise();
            });
        } else {
            throw error;
        }
    }

}

async function createRoleIfNeed(functionMeta: any, accountId: string, region: string) {
    if (!functionMeta.role) {
        const roleName = `${functionMeta.name}-role-malagu`;
        try {
            const { Role } = await iamClient.getRole({ RoleName: roleName }).promise();
            functionMeta.role = Role.Arn;
        } catch (error) {
            if (error.statusCode === 404) {
                await spinner(`Create ${roleName} role`, async () => {
                    await iamClient.createRole({
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
                    const policyName = `AWSLambdaBasicExecutionRole-${v4()}`;
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
                    await iamClient.attachRolePolicy({ RoleName: roleName, PolicyArn: Policy?.Arn! }).promise();

                });
            } else {
                throw error;
            }
        }
    }
}

async function publishVersion(functionName: string) {
    const { functionVersion } = await spinner('Publish Version', async () => {
        await checkStatus(functionName);
        const { Version } = await lambdaClient.publishVersion({ FunctionName: functionName }).promise();
        return {
            functionVersion: Version,
            successText: `Publish Version ${Version}`
        };
    });
    return functionVersion;
}

function parseCreateAliasRequest(aliasMeta: any, functionVersion: string) {
    const req: Lambda.Types.CreateAliasRequest = <Lambda.Types.CreateAliasRequest>{
        ...parseUpdateAliasRequest(aliasMeta, functionVersion)
    };
    return req;
}

function parseUpdateAliasRequest(aliasMeta: any, functionVersion: string) {
    const req: Lambda.Types.UpdateAliasRequest = {
        Name: aliasMeta.name,
        FunctionName: aliasMeta.functionName,
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

async function createOrUpdateAlias(alias: any, functionVersion: string) {
    const getAliasRequest: Lambda.Types.GetAliasRequest = {
        FunctionName: alias.functionName,
        Name: alias.name
    };
    try {
        await lambdaClient.getAlias(getAliasRequest).promise();
        await spinner(`Update ${alias.name} alias to version ${functionVersion}`, async () => {
            await checkStatus(alias.functionName);
            await lambdaClient.updateAlias(parseUpdateAliasRequest(alias, functionVersion)).promise();
        });
    } catch (error) {
        if (error.statusCode === 404) {
            await spinner(`Create ${alias.name} alias to version ${functionVersion}`, async () => {
                await checkStatus(alias.functionName);
                await lambdaClient.createAlias(parseCreateAliasRequest(alias, functionVersion)).promise();
            });
        } else {
            throw error;
        }
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

async function createOrUpdateApi(api: any, functionName: string, region: string, accountId: string) {
    const apiName = api.name;
    const { Items } = await apiGatewayClient.getApis({ MaxResults: '500' }).promise();
    const items = (Items || []).filter(item => item.Name === apiName);
    let result: ApiGatewayV2.UpdateApiResponse | ApiGatewayV2.CreateApiResponse;
    if (items.length > 1) {
        throw new Error(`There are two or more apis named [${apiName}] in the api gateway`);
    } else if (items.length === 1) {
        result = await spinner(`Update ${apiName} api`, async () => {
            const apiId = items[0].ApiId!;
            return apiGatewayClient.updateApi(parseUpdateApiRequest(api, apiId)).promise();
        });
    } else {
        result = await spinner(`Create ${apiName} api`, () => apiGatewayClient.createApi(parseCreateApiRequest(api)).promise());
        await lambdaClient.addPermission({
            FunctionName:  functionName,
            StatementId: 'malagu-apigateway',
            Action: 'lambda:InvokeFunction',
            Principal: 'apigateway.amazonaws.com',
            SourceArn: `arn:aws:execute-api:${region}:${accountId}:${result.ApiId}/*/*/*`
        }).promise();
    }

    return result;
}

async function createOrUpdateIntegration(integrationMeta: any, apiId: string) {
    const { Items } = await apiGatewayClient.getIntegrations({ ApiId: apiId, MaxResults: '100' }).promise();
    const items = Items || [];
    let result: ApiGatewayV2.UpdateIntegrationResult | ApiGatewayV2.CreateIntegrationResult;
    if (items.length > 1) {
        throw new Error(`There are two or more integrations in the api [${apiId}]`);
    } else if (items.length === 1) {
        const integrationId = items[0].IntegrationId!;
        await spinner(`Update ${integrationId} integration`, async () => {
            result = await apiGatewayClient.updateIntegration(parseUpdateIntegrationRequest(integrationMeta, apiId, integrationId)).promise();

        });
    } else {
        await spinner('Create integration', async () => {
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
    const { Items } = await apiGatewayClient.getRoutes({ ApiId: apiId }).promise();
    const items = Items || [];
    let result: ApiGatewayV2.UpdateRouteResult | ApiGatewayV2.CreateRouteResult;
    if (items.length > 1) {
        throw new Error(`There are two or more routes in the api [${apiId}]`);
    } else if (items.length === 1) {
        const routeId = items[0].RouteId!;
        await spinner(`Update route: ${routeMeta.routeKey}`, async () => {
            result = await apiGatewayClient.updateRoute(parseUpdateRouteRequest(routeMeta, apiId, integrationId, routeId)).promise();

        });
    } else {
        await spinner(`Create route: ${routeMeta.routeKey}`, async () => {
            result = await apiGatewayClient.createRoute(parseCreateRouteRequest(routeMeta, apiId, integrationId)).promise();
        });
    }

    return result!;
}

function parseUpdateDomainNameRequest(customDomainMeta: any) {
    const req: ApiGatewayV2.UpdateDomainNameRequest = {
        DomainName: customDomainMeta.name
    };

    const { domainNameConfigurations, mutualTlsAuthentication } = customDomainMeta;

    if (domainNameConfigurations) {
        req.DomainNameConfigurations = [];
        for (const config of domainNameConfigurations) {
            req.DomainNameConfigurations.push({
                ApiGatewayDomainName: config.ApiGatewayDomainName,
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

function parseCreateDomainNameRequest(customDomainMeta: any) {
    const req: ApiGatewayV2.CreateDomainNameRequest = {
        ...parseUpdateDomainNameRequest(customDomainMeta),
    };
    return req;

}

async function bindOrUpdateCustomDomain(customDomain: any) {
    try {
        await apiGatewayClient.getDomainName({ DomainName: customDomain.name }).promise();
        await spinner(`Update ${customDomain.name} customDomain`, async () => {
            await apiGatewayClient.updateDomainName(parseUpdateDomainNameRequest(customDomain)).promise();
        });
    } catch (error) {
        if (error.statusCode === 404) {
            await spinner(`Create ${customDomain.name} customDomain`, async () => {
                await apiGatewayClient.createDomainName(parseCreateDomainNameRequest(customDomain)).promise();
            });
        } else {
            throw error;
        }
    }

    console.log(chalk`    - Url: ${chalk.green.bold(`https://${customDomain.name}`)}`);
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
    const { Items } = await apiGatewayClient.getApiMappings({ DomainName: domainName }).promise();
    const items = Items || [];

    if (items.length > 1) {
        throw new Error(`There are two or more apiMapping named in the domainName [${domainName}]`);
    } else if (items.length === 1) {
        const apiMappingId = items[0].ApiMappingId!;
        await spinner(`Update ${apiMappingId} api mapping  for ${domainName}`, async () => {
            await apiGatewayClient.updateApiMapping(parseUpdateApiMappingRequest(apiMapping, domainName, apiId, stageName, apiMappingId)).promise();
        });
    } else {
        await spinner(`Create api mapping for ${domainName}`, async () => {
            await apiGatewayClient.createApiMapping(parseCreateApiMappingRequest(apiMapping, domainName, apiId, stageName)).promise();
        });
    }
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
    try {
        await apiGatewayClient.getStage({ ApiId: apiId, StageName: stage.name }).promise();
        await spinner(chalk`Deploy {yellow.bold ${stage.name}} stage`, async () => {
            const { DeploymentId } = await createDeployment(apiId, stage.name);
            await apiGatewayClient.updateStage(parseUpdateStageRequest(stage, apiId, DeploymentId)).promise();
        });
    } catch (error) {
        if (error.statusCode === 404) {
            await spinner(`Create ${stage.name} stage`, async () => {
                await apiGatewayClient.createStage(parseCreateStageRequest(stage, apiId)).promise();
                await spinner(chalk`Deploy {yellow.bold ${stage.name}} stage`, async () => {
                    const { DeploymentId } = await createDeployment(apiId, stage.name);
                    await apiGatewayClient.updateStage(parseUpdateStageRequest(stage, apiId, DeploymentId)).promise();
                });
            });
        } else {
            throw error;
        }
    }
}

async function createDeployment(apiId: string, stageName: string) {
    return apiGatewayClient.createDeployment({ ApiId: apiId, StageName: stageName }).promise();
}

async function checkStatus(functionName: string) {
    let state = 'Pending';
    let times = 200;
    while ((state !== 'Active') && times > 0) {
        const tempFunc = await getFunction(functionName);
        state = tempFunc.Configuration?.State!;
        await delay(500);
        times = times - 1;
    }
    if (state !== 'Active') {
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
