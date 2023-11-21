import { InfoContext, ProjectUtil } from '@malagu/cli-common';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';
import { getAlias, getFunction, getCustomDomain, getTrigger, getLayer, createFcClient } from './utils';
import * as chalk from 'chalk';
import type FC20230330 from '@alicloud/fc20230330';

let fcClient: FC20230330;

export default async (context: InfoContext) => {
    const { cfg, pkg } = context;
    const cloudConfig = CloudUtils.getConfiguration(cfg);
    const { layer, trigger, alias, customDomain, disableProjectId } = cloudConfig;

    const profileProvider = new DefaultProfileProvider();
    const { region, account, credentials } = await profileProvider.provide(cloudConfig);
    fcClient = await createFcClient(cloudConfig, region, credentials, account);

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
    const functionName = functionMeta.name;

    const functionInfo = await getFunction(fcClient, functionName, true);
    context.output.functionInfo = functionInfo;
    if (!functionInfo) {
        return;
    }

    context.output.layerInfo = await getLayer(fcClient, layer?.name, true);

    context.output.aliasInfo = await getAlias(fcClient, alias.name, functionName, true);

    if (trigger?.name) {
        context.output.triggerInfo = await getTrigger(fcClient, functionName, trigger.name, region, account.id, true);
    }

    if (customDomain?.name) {
        context.output.groupInfo = await getCustomDomain(fcClient, customDomain.name, true, alias.name, {
            type: 'fc',
            user: account.id,
            region: region.replace(/_/g, '-').toLocaleLowerCase(),
            function: functionMeta.name.replace(/_/g, '-').toLocaleLowerCase()
        });
    }
};
