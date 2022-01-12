import { InfoContext, ProjectUtil } from '@malagu/cli-common';
import { Lambda, ApiGatewayV2 } from 'aws-sdk';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';
import { createClients, getAlias, getApi, getApiMapping, getCustomDomain, getFunction, getIntegration, getRoute, getStage, getTrigger } from './utils';
const chalk = require('chalk');

let lambdaClient: Lambda;
let apiGatewayClient: ApiGatewayV2;

export default async (context: InfoContext) => {
    const { cfg, pkg } = context;

    const cloudConfig = CloudUtils.getConfiguration(cfg);

    const profileProvider = new DefaultProfileProvider();
    const { region, credentials, account } = await profileProvider.provide(cloudConfig);

    const clients = await createClients(region, credentials);
    lambdaClient = clients.lambdaClient;
    apiGatewayClient = clients.apiGatewayClient;

    console.log(`\nGetting ${chalk.bold.yellow(pkg.pkg.name)} from the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);
    console.log(chalk`{bold.cyan - Profile: }`);
    console.log(`    - AccountId: ${account?.id}`);
    console.log(`    - Region: ${region}`);

    const { apiGateway, alias, disableProjectId } = cloudConfig;
    const projectId = await ProjectUtil.getProjectId();
    if (!projectId && !disableProjectId) {
        return;
    }
    const functionMeta = cloudConfig.function;
    functionMeta.name = disableProjectId ? functionMeta.name : `${functionMeta.name}_${projectId}`;
    const functionName = functionMeta.name;

    context.output.functionInfo = await getFunction(lambdaClient, functionName, alias.name, true);
    if (!context.output.functionInfo) {
        return;
    }
    context.output.aliasInfo = await getAlias(lambdaClient, functionName, alias.name, true);

    context.output.triggerInfo = await getTrigger(lambdaClient, functionName, undefined, alias.name, true);

    if (apiGateway) {
        const { api, stage, customDomain } = apiGateway;
        api.name = disableProjectId ? api.name : `${api.name}_${projectId}`;
        context.output.apiInfo = await getApi(apiGatewayClient, api.name, true, stage.name);
        if (context.output.apiInfo) {
            const apiId = context.output.apiInfo.ApiId!;
            context.output.integrationInfo = await getIntegration(apiGatewayClient, apiId, true);
            context.output.routeInfo = await getRoute(apiGatewayClient, apiId, true);
            context.output.stageInfo = await getStage(apiGatewayClient, apiId, stage.name, true);
            if (customDomain?.name) {
                context.output.customDomainInfo = await getCustomDomain(apiGatewayClient, customDomain.name, true);  
                context.output.apiMappingInfo = await getApiMapping(apiGatewayClient, customDomain.name, apiId, stage.name, true)              
            }
        }
    }

};

