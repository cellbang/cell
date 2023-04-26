import { CloudConfiguration, ProfileProvider, Profile } from './cloud-protocol';
import { CloudUtils } from './utils';

export class DefaultProfileProvider implements ProfileProvider {

    protected config: CloudConfiguration;

    async provide(config: CloudConfiguration, quiet: boolean = false): Promise<Profile> {
        this.config = config;
        const { region, account, credentials, regions, profilePath } = this.config;
        let profile: Profile = {
            account, credentials, region
        };

        if (!profile || !this.isAllRequiredExist(profile)) {
            profile = await this.getProfileFromEnv();
        }

        if (!this.isAllRequiredExist(profile)) {
            profile = <Profile>await CloudUtils.getProfileFromFile(profilePath);
        }

        if (!quiet && (!profile || !this.isAllRequiredExist(profile))) {
            return CloudUtils.promptForProfile(profilePath, regions);
        }

        profile.region = region ?? profile.region;

        return profile;
    }

    protected isAllRequiredExist(profile: Profile) {
        return profile.region && profile.credentials?.accessKeyId && profile.credentials?.accessKeySecret && profile.account?.id;
    }

    protected async getProfileFromEnv(): Promise<Profile> {
        return <Profile>{
            region: process.env.MALAGU_REGION,
            credentials: {
                accessKeyId: process.env.MALAGU_ACCESS_KEY_ID,
                accessKeySecret: process.env.MALAGU_ACCESS_KEY_SECRET
            },
            account: {
                id: process.env.MALAGU_ACCOUNT_ID
            }

        };
    }

}
