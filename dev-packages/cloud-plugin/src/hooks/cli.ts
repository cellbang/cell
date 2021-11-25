import { CliContext } from '@malagu/cli-common';
import { CmdOptions } from '.';
import { CloudUtils } from './utils';

export default async (context: CliContext) => {
    const { program, cfg } = context;
    program
        .command('config')
        .description('config cloud profile')
        .option('-u, --account-id [accountId]', 'Account id')
        .option('-i, --access-key-id [accessKeyId]', 'Access key id')
        .option('-k, --access-key-secret [accessKeySecret]', 'Access key secret')
        .option('-t, --token [token]', 'Access token')
        .option('-r, --region [region]', 'Region of deployment')
        .action((opts: CmdOptions) => {
            const { regions, profilePath } = CloudUtils.getConfiguration(cfg);
            CloudUtils.getProfile(profilePath, regions, opts);
        });
};
