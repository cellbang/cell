import { CliContext } from '@malagu/cli-common';
import { ConfigOptions, Profile } from './cloud-protocol';
import { CloudUtils } from './utils';
import { DefaultProfileProvider } from './profile-provider';
import { dump } from 'js-yaml';

export default async (context: CliContext) => {
    const { cfg, options } = context;
    const config = CloudUtils.getConfiguration(cfg);

    const { regions, profilePath, name } = config;
    const opts = options as ConfigOptions;
    if (opts.accessKeyId || opts.accessKeySecret || opts.accountId || opts.region || opts.stage) {
        const profile = await CloudUtils.getProfileFromFile(profilePath) || <Profile>{ credentials: {}, account: {} };
        profile.account.id = opts.accountId || profile.account.id;
        profile.credentials.accessKeyId = opts.accessKeyId || profile.credentials.accessKeyId;
        profile.credentials.accessKeySecret = opts.accessKeySecret || profile.credentials.accessKeySecret;
        profile.region = opts.region || profile.region;
        profile.stage = opts.stage || profile.stage;
        profile.credentials.token = opts.token || profile.credentials.token;
        await CloudUtils.saveProfile(profilePath, profile);
    }
    if (opts.show) {
        context.output.profile = await new DefaultProfileProvider().provide(config, true);
    }
    if (opts.showProfile) {
        context.output.profile = await CloudUtils.getProfileFromFile(profilePath);
        if (context.output.profile) {
            console.log(dump(context.output));
        }
    }
    if (opts.logout) {
        const profile: any = await CloudUtils.getProfileFromFile(profilePath) || <Profile>{ credentials: {}, account: {} };
        profile.account.id = undefined;
        profile.credentials.accessKeyId = undefined;
        profile.credentials.accessKeySecret = undefined;
        profile.credentials.token = undefined;
        await CloudUtils.saveProfile(profilePath, profile);
    }
    if (Object.keys(opts).length === 0) {
        console.log(`Config ${name} cloud account:`)
        await CloudUtils.promptForProfile(profilePath, regions);
    }
    
};
