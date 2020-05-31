import { ConfigContext } from '@malagu/cli';
import { ProfileProvider } from './profile-provider';

export default async (context: ConfigContext) => {
    const { config } = context;
    if (config.mode && config.mode.includes('remote')) {
        const profileProvider = new ProfileProvider();
        if (!config.deployConfig.profile) {
            const profile = await profileProvider.provide();
            config.deployConfig.profile = {
                accountId: profile.accountId,
                defaultRegion: profile.defaultRegion
            };
        }
    }
};
