import { InfoContext } from '@malagu/cli-common';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';
import { createClients, getAlias, getService, getFunction, getApi, getCustomDomain, getTrigger, getGroup } from './utils';
const chalk = require('chalk');

let fcClient: any;
let apiClient: any;

export default async (context: InfoContext) => {

    const { cfg, pkg } = context;

    const cloudConfig = CloudUtils.getConfiguration(cfg);
    const faasConfig = cloudConfig.faas;

    const profileProvider = new DefaultProfileProvider();
    const { region, account, credentials } = await profileProvider.provide(cloudConfig);

    const clients = await createClients(faasConfig, region, credentials, account);
    fcClient = clients.fcClient;
    apiClient = clients.apiClient;

    const { service, trigger, apiGateway, alias, customDomain } = faasConfig;
    const functionMeta = faasConfig.function;
    const serviceName = service.name;
    const functionName = functionMeta.name;

    console.log(`\nGetting ${chalk.bold.yellow(pkg.pkg.name)} from the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);
    console.log(chalk`{bold.cyan - Profile: }`);
    console.log(`    - AccountId: ${account?.id}`);
    console.log(`    - Region: ${region}`);
    
    context.output.serviceInfo = await getService(fcClient, serviceName, true);
    if (!context.output.serviceInfo) {
        return;
    }

    context.output.functionInfo = await getFunction(fcClient, serviceName, functionName, true);
    if (!context.output.functionInfo) {
        return;
    }

    context.output.aliasInfo = await getAlias(fcClient, alias.name, serviceName, true);

    if (trigger?.name) {
        context.output.triggerInfo = await getTrigger(fcClient, serviceName, functionName, trigger.name, region, account.id, true);
    }

    if (apiGateway) {
        const { group, api } = apiGateway;
        context.output.groupInfo = await getGroup(apiClient, group.name, true);
        if (context.output.groupInfo) {
            const groupId = context.output.groupInfo.GroupId;
            context.output.apiInfo = await getApi(apiClient, groupId, api.name, true);
        }
    }

    if (customDomain?.name) {
        context.output.groupInfo = await getCustomDomain(fcClient, customDomain.name, true);
    }
};
