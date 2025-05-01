import { CloudConfiguration, ProfileProvider, Profile } from './cloud-protocol';
import { CloudUtils } from './utils';

export class DefaultProfileProvider implements ProfileProvider {

    protected config: CloudConfiguration;

    async provide(config: CloudConfiguration, quiet = false): Promise<Profile> {
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

        if (profile) {
            profile.region = region ?? profile.region;
        }

        return profile;
    }

    protected isAllRequiredExist(profile: Profile) {
        return profile.region && profile.credentials?.accessKeyId && profile.credentials?.accessKeySecret && profile.account?.id;
    }

    protected async getProfileFromEnv(): Promise<Profile> {
        return <Profile>{
            region: process.env.CELL_REGION,
            credentials: {
                accessKeyId: process.env.CELL_ACCESS_KEY_ID,
                accessKeySecret: process.env.CELL_ACCESS_KEY_SECRET
            },
            account: {
                id: process.env.CELL_ACCOUNT_ID
            }

        };
    }

}
