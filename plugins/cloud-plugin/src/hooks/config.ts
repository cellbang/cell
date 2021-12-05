import { CliContext } from '@malagu/cli-common';
import { ConfigOptions, Profile } from './cloud-protocol';
import { CloudUtils } from './utils';
import { readFileSync, existsSync } from 'fs-extra';

export default async (context: CliContext) => {
    const { cfg, options } = context;
    const { regions, profilePath, name } = CloudUtils.getConfiguration(cfg);
    const opts = options as ConfigOptions;
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
    if (opts.show) {
        const fullProfilePath = CloudUtils.getProfilePath(profilePath);
        if (existsSync(fullProfilePath)) {
            console.log(readFileSync(fullProfilePath, { encoding: 'utf8' }));
        }
    }
    if (Object.keys(opts).length === 0) {
        console.log(`Config ${name} cloud account:`)
        CloudUtils.promptForProfile(profilePath, regions);
    }
    
};
