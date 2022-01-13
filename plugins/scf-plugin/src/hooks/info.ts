import { InfoContext, ProjectUtil } from '@malagu/cli-common';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';
import { createClients, getAlias, getApi, getCustomDomain, getFunction, getNamespace, getService, getTrigger, getUsagePlan } from './utils';
const chalk = require('chalk');

let scfClient: any;
let apiClient: any;

export default async (context: InfoContext) => {
    const { cfg, pkg } = context;

    const cloudConfig = CloudUtils.getConfiguration(cfg);

    const profileProvider = new DefaultProfileProvider();
    const { region, credentials, account } = await profileProvider.provide(cloudConfig);

    const clients = await createClients(region, credentials);
    scfClient = clients.scfClient;
    apiClient = clients.apiClient;

    console.log(`\nGetting ${chalk.bold.yellow(pkg.pkg.name)} from the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);
    console.log(chalk`{bold.cyan - Profile: }`);
    console.log(`    - AccountId: ${account?.id}`);
    console.log(`    - Region: ${region}`);

    const { namespace, apiGateway, alias, disableProjectId } = cloudConfig;
    const projectId = await ProjectUtil.getProjectId();
    if (!projectId && !disableProjectId) {
        return;
    }
    const functionMeta = cloudConfig.function;
    functionMeta.name = disableProjectId ? functionMeta.name : `${functionMeta.name}_${projectId}`;
    const functionName = functionMeta.name;

    context.output.functionInfo = await getFunction(scfClient, namespace.name, functionName, alias.name, true);
    if (!context.output.functionInfo) {
        return;
    }

    const tasks: Promise<void>[] = []; 
    tasks.push(getNamespace(scfClient, namespace.name, true).then(data => context.output.namespaceInfo = data));
    tasks.push(getAlias(scfClient, alias.name, namespace.name, functionName, undefined, true).then(data => context.output.aliasInfo = data));
    tasks.push(getTrigger(scfClient, namespace.name, functionName, undefined, alias.name, true).then(data => context.output.triggerInfo = data));

    if (apiGateway) {
        const { usagePlan, api, service, release, customDomain } = apiGateway;
        service.name = disableProjectId ? service.name : `${service.name}_${projectId}`;
        context.output.serviceInfo = await getService(apiClient, service.name, true);
        if (context.output.serviceInfo) {
            const serviceId = context.output.serviceInfo.ServiceId;
            const subDomain = context.output.serviceInfo.OuterSubDomain;
            const protocol = context.output.serviceInfo.Protocol;
            context.output.apiInfo = await getApi(apiClient, serviceId, api.name, true, subDomain, protocol, release.environmentName);

            if (usagePlan.name) {
                tasks.push(getUsagePlan(apiClient, usagePlan.name, true).then(data => context.output.usagePlanInfo = data));
            }
            if (customDomain?.name) {
                tasks.push(getCustomDomain(apiClient, serviceId, customDomain.name, true, release.environmentName).then(data => context.output.customDomainInfo = data));
            }
        }
    }

    await Promise.all(tasks);
};
