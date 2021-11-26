import { CliContext } from '@malagu/cli-common';
import { ConfigOptions, Profile } from './cloud-protocol';
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
        .action(async (opts: ConfigOptions) => {
            const { regions, profilePath } = CloudUtils.getConfiguration(cfg);
            if (opts.accessKeyId || opts.accessKeySecret || opts.accountId || opts.region) {
                const profile = await CloudUtils.getProfileFromFile(profilePath) || <Profile>{ credentials: {}, account: {} };
                profile.account.id = opts.accountId || profile.account.id;
                profile.credentials.accessKeyId = opts.accessKeyId || profile.credentials.accessKeyId;
                profile.credentials.accessKeySecret = opts.accessKeySecret || profile.credentials.accessKeySecret;
                profile.region = opts.region || profile.region;
                profile.token = opts.token || profile.token;
                await CloudUtils.saveProfile(profilePath, profile);
                return;
            }
            CloudUtils.promptForProfile(profilePath, regions);
        });
};
