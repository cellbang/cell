import { CliContext } from '@celljs/cli-common';
import { Profile } from '@celljs/cloud-plugin';
import { CloudUtils } from '@celljs/cloud-plugin/lib/hooks/utils';
import { prompt } from 'prompts';

export async function promptForProfile(profilePath: string, regions: string[]): Promise<Profile> {
    const mark = (source?: string) => {
        if (source) {
            source = source + '';
            const subStr = source.slice(-4);
            return `***********${subStr}`;
        }
    };
    let profile: any = {};
    profile = await CloudUtils.getProfileFromFile(profilePath) || profile;
    const markedAppId = mark(profile.appId);
    const questions = [
        {
            type: 'text',
            name: 'appId',
            message: 'App Id',
            initial: markedAppId
        },
    ];
    const { appId }: any = await prompt(questions);
    if (appId !== markedAppId) {
        profile.appId = appId;
    }

    await CloudUtils.saveProfile(profilePath, profile);
    return profile;
}

export default async (context: CliContext) => {
    const { cfg, options } = context;
    const config = CloudUtils.getConfiguration(cfg);

    const { regions, profilePath } = config;
    const opts = options || {};

    if (Object.keys(opts).length === 0) {
        await promptForProfile(profilePath, regions);
    }

};

