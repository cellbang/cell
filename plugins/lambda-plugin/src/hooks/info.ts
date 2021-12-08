import { InfoContext } from '@malagu/cli-common';
import { Lambda, ApiGatewayV2 } from 'aws-sdk';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';
import { createClients, getAlias, getApi, getApiMapping, getCustomDomain, getFunction, getIntegration, getRoute, getStage, getTrigger } from './utils';
const chalk = require('chalk');

let lambdaClient: Lambda;
let apiGatewayClient: ApiGatewayV2;

export default async (context: InfoContext) => {
    const { cfg, pkg } = context;

    const cloudConfig = CloudUtils.getConfiguration(cfg);
    const faasConfig = cloudConfig.faas;

    const profileProvider = new DefaultProfileProvider();
    const { region, credentials } = await profileProvider.provide(cloudConfig);

    const clients = await createClients(region, credentials);
    lambdaClient = clients.lambdaClient;
    apiGatewayClient = clients.apiGatewayClient;
    
    const { alias, apiGateway, customDomain } = faasConfig;
    const functionMeta = faasConfig.function;
    const functionName = functionMeta.name;

    console.log(`\nGetting ${chalk.bold.yellow(pkg.pkg.name)} from the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);

    context.output.functionInfo = await getFunction(lambdaClient, functionName, true);
    if (!context.output.functionInfo) {
        return;
    }
    context.output.aliasInfo = await getAlias(lambdaClient, functionName, alias.name, true);

    context.output.triggerInfo = await getTrigger(lambdaClient, functionName, undefined, alias.name, true);

    if (apiGateway) {
        const { api, stage } = apiGateway;
        context.output.apiInfo = await getApi(apiGatewayClient, api.name, true);
        if (context.output.apiInfo) {
            const apiId = context.output.apiInfo.ApiId!;
            context.output.integrationInfo = await getIntegration(apiGatewayClient, apiId, true);
            context.output.routeInfo = await getRoute(apiGatewayClient, apiId, true);
            context.output.stageInfo = await getStage(apiGatewayClient, apiId, stage.name, true);
            if (customDomain.name) {
                context.output.customDomainInfo = await getCustomDomain(apiGatewayClient, customDomain.name, true);  
                context.output.apiMappingInfo = await getApiMapping(apiGatewayClient, customDomain.name, true)              
            }
        }
    }

};

