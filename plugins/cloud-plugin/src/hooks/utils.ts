import { ensureFile, existsSync, readFile, writeFile } from 'fs-extra';
import { prompt } from 'prompts';
import { resolve, sep } from 'path';
import { CloudConfiguration, Profile } from './cloud-protocol';
import { load, dump } from 'js-yaml';
import { ApplicationConfig, BACKEND_TARGET, ConfigUtil, PathUtil } from '@malagu/cli-common';
import { CodeUri } from '@malagu/code-loader-plugin/lib/code-protocol';

export namespace CloudUtils {

    export function getConfiguration(cfg: ApplicationConfig): CloudConfiguration {
        return ConfigUtil.getMalaguConfig(cfg, BACKEND_TARGET).cloud || {};
    }

    export function getProfilePath(profilePath: string) {
        return resolve(PathUtil.getMalaguHomePath(), profilePath.split('/').join(sep));
    }

    export async function getProfileFromFile(profilePath: string): Promise<Profile | undefined> {
        const path = getProfilePath(profilePath);

        const isExists = existsSync(path);
        if (!isExists) {
            return;
        }

        const content = await readFile(path, 'utf8');
        return load(content) as Profile;
    }

    export async function promptForProfile(profilePath: string, regions: string[]): Promise<Profile> {
        const mark = (source?: string) => {
            if (source) {
                source = source + '';
                const subStr = source.slice(-4);
                return `***********${subStr}`;
            }
        };
        let profile: Profile = { account: { id: '' }, credentials: { accessKeyId: '', accessKeySecret: '' }, region: '' };
        profile = await getProfileFromFile(profilePath) || profile;
        const markedAccountId = mark(profile.account.id);
        const markedaccessKeyId = mark(profile.credentials.accessKeyId);
        const markedAccessKeySecret = mark(profile.credentials.accessKeySecret);
        const currentRegionIndex = regions.indexOf(profile.region);
        const questions = [
            {
                type: 'text',
                name: 'accountId',
                message: 'Account Id',
                initial: markedAccountId
            },
            {
                type: 'text',
                name: 'accessKeyId',
                message: 'Access Key Id',
                initial: markedaccessKeyId
            },
            {
                type: 'password',
                name: 'accessKeySecret',
                message: 'Access Key Secret',
                initial: markedAccessKeySecret
            },
            {
                type: 'select',
                name: 'region',
                message: 'Default region name',
                choices: regions,
                initial: currentRegionIndex === -1 ? 0 : currentRegionIndex
            }
        ];

        const { accountId, accessKeyId, accessKeySecret, region }: any = await prompt(questions);
        if (accountId !== markedAccountId) {
            profile.account.id = accountId;
        }
        if (accessKeyId !== markedaccessKeyId) {
            profile.credentials.accessKeyId = accessKeyId;
        }
        if (accessKeySecret !== markedAccessKeySecret) {
            profile.credentials.accessKeySecret = accessKeySecret;
        }

        profile.region = regions[region];
        await saveProfile(profilePath, profile);
        return profile;
    }

    export async function saveProfile(profilePath: string, profile: Profile): Promise<void> {
        const path = getProfilePath(profilePath);
        await ensureFile(path);
        await writeFile(path, dump(profile));
    }

    export function parseS3Uri(codeUri: string | CodeUri): { bucket: string, key: string, version?: string, region?: string } | undefined {
        const uri = typeof codeUri === 'string' ? codeUri : codeUri.value;
        if (uri?.toLowerCase().startsWith('s3://')) {
            const parsedUri = new URL(uri);
            const version = parsedUri.searchParams.get('version');
            const region = parsedUri.searchParams.get('region');

            return {
                bucket: parsedUri.host,
                key: parsedUri.pathname.substring(1),
                version: version ? version : undefined,
                region: region ? region : undefined
            };
        }
    }
}
