import { InfoContext, ProjectUtil } from '@malagu/cli-common';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';
import { createClients, getAlias, getService, getFunction, getApi, getCustomDomain, getTrigger, getGroup } from './utils';
const chalk = require('chalk');

let fcClient: any;
let apiClient: any;

export default async (context: InfoContext) => {

    const { cfg, pkg } = context;

    const cloudConfig = CloudUtils.getConfiguration(cfg);

    const profileProvider = new DefaultProfileProvider();
    const { region, account, credentials } = await profileProvider.provide(cloudConfig);

    const clients = await createClients(cloudConfig, region, credentials, account);
    fcClient = clients.fcClient;
    apiClient = clients.apiClient;

    const { service, trigger, apiGateway, alias, customDomain, disableProjectId } = cloudConfig;

    console.log(`\nGetting ${chalk.bold.yellow(pkg.pkg.name)} from the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);
    console.log(chalk`{bold.cyan - Profile: }`);
    console.log(`    - AccountId: ${account?.id}`);
    console.log(`    - Region: ${region}`);

    const projectId = await ProjectUtil.getProjectId();
    if (!projectId && !disableProjectId) {
        return;
    }
    const functionMeta = cloudConfig.function;
    functionMeta.name = disableProjectId ? functionMeta.name : `${functionMeta.name}_${projectId}`;
    const serviceName = service.name;
    const functionName = functionMeta.name;

    context.output.functionInfo = await getFunction(fcClient, serviceName, functionName, true);
    if (!context.output.functionInfo) {
        return;
    }
    
    context.output.serviceInfo = await getService(fcClient, serviceName, alias.name, true);
    if (!context.output.serviceInfo) {
        return;
    }

    context.output.aliasInfo = await getAlias(fcClient, alias.name, serviceName, true);

    if (trigger?.name) {
        context.output.triggerInfo = await getTrigger(fcClient, serviceName, functionName, trigger.name, region, account.id, true);
    }

    if (apiGateway) {
        const { group, api } = apiGateway;
        group.name = disableProjectId ? group.name : `${group.name}_${projectId}`;
        context.output.groupInfo = await getGroup(apiClient, group.name, true);
        if (context.output.groupInfo) {
            const groupId = context.output.groupInfo.GroupId;
            const subDomain = context.output.groupInfo.SubDomain;
            const path = api.requestConfig.path;
            const protocol = api.requestConfig.protocol;
            context.output.apiInfo = await getApi(apiClient, groupId, api.name, true, subDomain, path, protocol);
        }
    }

    if (customDomain?.name) {
        context.output.groupInfo = await getCustomDomain(fcClient, customDomain.name, true, alias.name);
    }
};
