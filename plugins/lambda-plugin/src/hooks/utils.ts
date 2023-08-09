import { Credentials } from '@malagu/cloud-plugin';
import { Lambda, ApiGatewayV2, IAM } from 'aws-sdk';
const chalk = require('chalk');

export async function getTrigger(client: Lambda, functionName: string, eventSourceArn?: string, aliasName?: string, print = false) {
    const listEventSourceMappingsRequest: Lambda.Types.ListEventSourceMappingsRequest = {
        FunctionName: functionName,
        MaxItems: 100
    };
    const resp = await client.listEventSourceMappings(listEventSourceMappingsRequest).promise();
    const result = resp
        .EventSourceMappings?.find(e => eventSourceArn && e.EventSourceArn === eventSourceArn || aliasName && e.FunctionArn?.endsWith(`:${functionName}:${aliasName}`));
    if (result) {
        if (print) {
            console.log(chalk`\n{bold.cyan - Trigger:}`);
            console.log(`    - EventSourceArn: ${result.EventSourceArn}`);
            console.log(`    - State: ${result.State}`);
            console.log(`    - LastModified: ${result.LastModified}`);
        }
        return result;
    }

}

export async function getStage(client: ApiGatewayV2, apiId: string, stageName: string, print = false) {
    try {
        const result = await client.getStage({ ApiId: apiId, StageName: stageName }).promise();
        if (print) {
            console.log(chalk`{bold.cyan - Stage: }`);
            console.log(`    - StageName: ${result.StageName}`);
            console.log(`    - LastUpdatedDate: ${result.LastUpdatedDate}`);
        }
        return result;
    } catch (error) {
        if (error.statusCode !== 404) {
            throw error;
        }
    }
}

export async function getRoute(client: ApiGatewayV2, apiId: string, print = false) {
    const { Items } = await client.getRoutes({ ApiId: apiId }).promise();
    const items = Items || [];
    if (items.length > 1) {
        throw new Error(`There are two or more routes in the api [${apiId}]`);
    } else if (items.length === 1) {
        const result = items[0];
        if (print) {
            console.log(chalk`{bold.cyan - Route: }`);
            console.log(`    - RouteId: ${result.RouteId}`);
            console.log(`    - RouteKey: ${result.RouteKey}`);
        }
        return result;
    }
}

export async function getApi(client: ApiGatewayV2, apiName: string, print = false, stageName?: string) {
    const { Items } = await client.getApis({ MaxResults: '500' }).promise();
    const items = (Items || []).filter(item => item.Name === apiName);
    if (items.length > 1) {
        throw new Error(`There are two or more apis named [${apiName}] in the api gateway`);
    } else if (items.length === 1) {
        const result = items[0];
        if (print) {
            console.log(chalk`{bold.cyan - API: }`);
            console.log(`    - ApiId: ${result.ApiId}`);
            console.log(`    - ApiName: ${result.Name}`);
            console.log(`    - ApiEndpoint: ${result.ApiEndpoint}`);
            console.log(`    - ProtocolType: ${result.ProtocolType}`);
            console.log(`    - ApiUrl: ${result.ApiEndpoint}/${stageName}/`);
        }
        return result;
    }
}

export async function getIntegration(client: ApiGatewayV2, apiId: string, print = false) {
    const { Items } = await client.getIntegrations({ ApiId: apiId, MaxResults: '500' }).promise();
    const items = Items || [];
    if (items.length > 1) {
        throw new Error(`There are two or more integrations in the api [${apiId}]`);
    } else if (items.length === 1) {
        const result = items[0];
        if (print) {
            console.log(chalk`{bold.cyan - Integration: }`);
            console.log(`    - IntegrationId: ${result.IntegrationId}`);
            console.log(`    - PayloadFormatVersion: ${result.PayloadFormatVersion}`);
            console.log(`    - TimeoutInMillis: ${result.TimeoutInMillis}`);
        }
        return result;
    }
}

export async function createClients(region: string, credentials: Credentials) {
    const clientConfig = {
        region,
        credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.accessKeySecret,
            sessionToken: credentials.token
        }
    };
    return {
        lambdaClient: new Lambda(clientConfig),
        apiGatewayClient: new ApiGatewayV2(clientConfig),
        iamClient: new IAM(clientConfig)
    };
}

export async function getCustomDomain(client: ApiGatewayV2, customDomainName: string, print = false) {
    try {
        const result = await client.getDomainName({ DomainName: customDomainName }).promise();
        if (print) {
            console.log(chalk`{bold.cyan - CustomDomaim: }`);
            console.log(`    - DomainName: ${result.DomainName}`);
        }
        return result;
    } catch (error) {
        if (error.statusCode !== 404) {
            throw error;
        }
    }
}

export async function getApiMapping(client: ApiGatewayV2, domainName: string, apiId: string, stageName: string, print = false) {
    const { Items } = await client.getApiMappings({ DomainName: domainName  }).promise();
    const result = (Items || []).find(item => item.ApiId === apiId && stageName === item.Stage);

    if (result) {
        if (print) {
            console.log(chalk`{bold.cyan - ApiMapping: }`);
            console.log(`    - ApiMappingId: ${result.ApiMappingId}`);
            console.log(`    - ApiMappingKey: ${result.ApiMappingKey}`);
            console.log(`    - Stage: ${result.Stage}`);
            console.log(`    - ApiUrl: https://${domainName}/${result.ApiMappingKey?.split('*')[0]}`);

        }
        return result;
    }
}

export async function getFunction(client: Lambda, functionName: string, qualifier?: string, print = false) {

    try {
        const result = await client.getFunction({ FunctionName: functionName, Qualifier: qualifier }).promise();
        if (print && result.Configuration) {
            const functionInfo = result.Configuration;
            console.log(chalk`{bold.cyan - Function:}`);
            console.log(`    - FunctionName: ${functionName}`);
            console.log(`    - State: ${functionInfo.State}`);
            console.log(`    - StateReason: ${functionInfo.StateReason}`);
            console.log(`    - LastUpdateStatus: ${functionInfo.LastUpdateStatus}`);
            console.log(`    - Timeout: ${functionInfo.LastUpdateStatusReason}`);
            console.log(`    - FunctionArn: ${functionInfo.FunctionArn}`);
            console.log(`    - KMSKeyArn: ${functionInfo.KMSKeyArn}`);
            console.log(`    - MemorySize: ${functionInfo.MemorySize}`);
            console.log(`    - Role: ${functionInfo.Role}`);
            console.log(`    - Runtime: ${functionInfo.Runtime}`);
            console.log(`    - LastModifiedTime: ${functionInfo.LastModified}`);

            const vpcConfig = functionInfo.VpcConfig;
            if (vpcConfig?.VpcId) {
                console.log('    - VpcConfig:');
                console.log(`        - VpcId: ${vpcConfig.VpcId}`);
                console.log(`        - SubnetIds: ${vpcConfig.SubnetIds}`);
                console.log(`        - SubnetIds: ${vpcConfig.SecurityGroupIds}`);
            }

            const deadLetterConfig = functionInfo.DeadLetterConfig;
            if (deadLetterConfig?.TargetArn) {
                console.log('    - DeadLetterConfig:');
                console.log(`        - TargetArn: ${deadLetterConfig.TargetArn}`);
            }

            const fileSystemConfigs = functionInfo.FileSystemConfigs;
            if (fileSystemConfigs?.length) {
                console.log('    - FileSystemConfig:');
                for (const config of fileSystemConfigs) {
                    console.log(`        - Arn: ${config.Arn}`);
                    console.log(`          LocalMountPath: ${config.LocalMountPath}`);
                }
            }

            const tracingConfig = functionInfo.TracingConfig;
            if (tracingConfig?.Mode) {
                console.log('    - TracingConfig:');
                console.log(`        - Mode: ${tracingConfig.Mode}`);
            }
        }
        return result;

    } catch (error) {
        if (error.statusCode !== 404) {
            throw error;
        }
    }

}

export async function getAlias(client: Lambda, functionName: string, aliasName: string, print = false) {

    try {
        const result = await client.getAlias({ FunctionName: functionName, Name: aliasName }).promise();
        if (print) {
            console.log(chalk`{bold.cyan - Alias:}`);
            console.log(`    - AliasName: ${result.Name}`);
            console.log(`    - FunctionVersion: ${result.FunctionVersion}`);
        }
        return result;
    } catch (error) {
        if (error.statusCode !== 404) {
            throw error;
        }
    }

}
