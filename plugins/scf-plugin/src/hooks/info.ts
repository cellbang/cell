import { InfoContext, ProjectUtil } from '@malagu/cli-common';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';
import { createClients, getAlias, getApi, getCustomDomain, getFunction, getNamespace, getService, getTrigger, getUsagePlan } from './utils';
const chalk = require('chalk');

let scfClient: any;
let apiClient: any;

export default async (context: InfoContext) => {
    const { cfg, pkg } = context;

    const cloudConfig = CloudUtils.getConfiguration(cfg);
    const faasConfig = cloudConfig.faas;

    const profileProvider = new DefaultProfileProvider();
    const { region, credentials, account } = await profileProvider.provide(cloudConfig);

    const clients = await createClients(region, credentials);
    scfClient = clients.scfClient;
    apiClient = clients.apiClient;

    console.log(`\nGetting ${chalk.bold.yellow(pkg.pkg.name)} from the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);
    console.log(chalk`{bold.cyan - Profile: }`);
    console.log(`    - AccountId: ${account?.id}`);
    console.log(`    - Region: ${region}`);

    const projectId = await ProjectUtil.getProjectId();
    if (!projectId) {
        return;
    }
    const { namespace, apiGateway, alias } = faasConfig;
    const functionMeta = faasConfig.function;
    functionMeta.name = `${functionMeta.name}_${projectId}`;
    const functionName = functionMeta.name;

    context.output.functionInfo = await getFunction(scfClient, namespace.name, functionName, alias.name, true);
    if (!context.output.functionInfo) {
        return;
    }

    context.output.namespaceInfo = await getNamespace(scfClient, namespace.name, true);
    if (!context.output.namespaceInfo) {
        return;
    }

    context.output.aliasInfo = await getAlias(scfClient, alias.name, namespace.name, functionName, undefined, true);

    context.output.triggerInfo = await getTrigger(scfClient, namespace.name, functionName, undefined, alias.name, true);

    if (apiGateway) {
        const { usagePlan, api, service, release, customDomain } = apiGateway;
        service.name = `${service.name}_${projectId}`;
        context.output.serviceInfo = await getService(apiClient, service.name, true);
        if (context.output.serviceInfo) {
            const serviceId = context.output.serviceInfo.ServiceId;
            const subDomain = context.output.serviceInfo.OuterSubDomain;
            const protocol = context.output.serviceInfo.Protocol;
            context.output.apiInfo = await getApi(apiClient, serviceId, api.name, true, subDomain, protocol, release.environmentName);

            if (usagePlan.name) {
                context.output.usagePlanInfo = await getUsagePlan(apiClient, usagePlan.name, true);
            }
            if (customDomain?.name) {
                context.output.customDomainInfo = await getCustomDomain(apiClient, serviceId, customDomain.name, true, release.environmentName);  
            }
        }
    }
};
