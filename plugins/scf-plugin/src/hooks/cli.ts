import { CliContext, ProjectUtil, SpinnerUtil } from '@celljs/cli-common';
import { CloudUtils, DefaultProfileProvider } from '@celljs/cloud-plugin';
import { createClients, getAlias } from './utils';
const chalk = require('chalk');

export default async (context: CliContext) => {
    const { program } = context;
    program
        .command('rollout')
        .description('rollout a new version of the function')
        .option('-v, --version, [version]', 'The version to rollback to. Default to 0 (last version).', '0')
        .action(async options => {
            const { cfg, pkg } = context;
            const cloudConfig = CloudUtils.getConfiguration(cfg);
            const profileProvider = new DefaultProfileProvider();
            const { region, credentials, account } = await profileProvider.provide(cloudConfig);

            const { scfClient } = await createClients(cloudConfig, region, credentials);

            console.log(`\nRollback ${chalk.bold.yellow(pkg.pkg.name)} from the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);
            console.log(chalk`{bold.cyan - Profile: }`);
            console.log(`    - AccountId: ${account?.id}`);
            console.log(`    - Region: ${region}`);

            const { alias, namespace, disableProjectId } = cloudConfig;
            const namespaceName = cloudConfig.function.namespace || namespace?.name;
            let functionName = cloudConfig.function.name;
            const projectId = await ProjectUtil.getProjectId();
            if (!disableProjectId) {
                if (!projectId) {
                    throw new Error('Project id is required, You need to deploy first.');
                }
                functionName = `${functionName}_${projectId}`;
            }
            let version = options.version;
            if (version === '0') {
                const result = await getAlias(scfClient, alias.name, namespaceName, functionName);
                version = parseInt(result.FunctionVersion) - 1;
                version += '';
                if (version === '0') {
                    throw new Error('Version 1 is not allowed to rollback.');
                }
            }

            await SpinnerUtil.start(`Rollback ${alias.name} alias to version ${version}`, async () => {
                await scfClient.UpdateAlias({
                    FunctionName: functionName,
                    FunctionVersion: version,
                    Name: alias.name,
                    Namespace: namespaceName
                });
            });
        });

};
