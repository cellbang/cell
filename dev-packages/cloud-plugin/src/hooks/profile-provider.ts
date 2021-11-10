import { CloudConfiguration, ProfileProvider, Profile } from './cloud-protocol';
import { CloudUtils } from './utils';
const dotenv = require('dotenv').config();

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
            profile = await this.getProfileFromDotEnv();
        }

        if (!this.isAllRequiredExist(profile)) {
            profile = <Profile>await CloudUtils.getProfileFromFile(profilePath);
        }

        if (!quiet && (!profile || !this.isAllRequiredExist(profile))) {
            return CloudUtils.promptForProfile(profilePath, regions);
        }

        return profile;
    }

    protected isAllRequiredExist(profile: Profile) {
        return profile.region && profile.credentials?.accessKeyId && profile.credentials?.accessKeySecret && profile.account?.id;
    }

    protected async getProfileFromDotEnv() {
        const profile: Profile = <Profile>{};
        if (dotenv) {
            if (dotenv.error) {
                return profile;
            }

            const parsed = dotenv.parsed;

            profile.region = parsed['MALAGU_REGION'];
            profile.credentials.accessKeyId = parsed['MALAGU_ACCESS_KEY_ID'];
            profile.credentials.accessKeySecret = parsed['MALAGU_ACCESS_KEY_SECRET'];
            profile.account.id = parsed['MALAGU_ACCOUNT_ID'];

        }

        return profile;
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
