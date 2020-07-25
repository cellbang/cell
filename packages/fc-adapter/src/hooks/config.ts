import { ConfigContext } from '@malagu/cli';
import { ProfileProvider, Profile } from './profile-provider';

export default async (context: ConfigContext) => {
    const { config } = context;
    if (config.mode && config.mode.includes('remote')) {
        const p: Profile = config.deployConfig.profile || {};
        if (!p.accountId) {
            const profileProvider = new ProfileProvider();
            const profile = await profileProvider.provide(true);
            config.deployConfig.profile = {
                accountId: profile.accountId,
                defaultRegion: profile.defaultRegion,
            };
        }
    }
};
