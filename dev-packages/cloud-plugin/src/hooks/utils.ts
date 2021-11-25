import { ensureFile, existsSync, readFile, writeFile } from 'fs-extra';
import { prompt } from 'inquirer';
import { resolve, sep } from 'path';
import { CloudConfiguration, CmdOptions, Profile } from './cloud-protocol';
import { load, dump } from 'js-yaml';
import { ApplicationConfig, BACKEND_TARGET, getMalaguConfig, getMalaguHomePath } from '@malagu/cli-common';
const merge = require('lodash.merge');

export namespace CloudUtils {

    export function getConfiguration(cfg: ApplicationConfig): CloudConfiguration {
        return { ...getMalaguConfig(cfg, BACKEND_TARGET).cloud };
    }

    export function getProfilePath(profilePath: string) {
        return resolve(getMalaguHomePath(), profilePath.split('/').join(sep));
    }

    export async function getProfileFromFile(profilePath: string): Promise<Profile | undefined> {
        const path = getProfilePath(profilePath);

        const isExists = existsSync(path);
        if (!isExists) {
            return;
        }

        const content = await readFile(path, 'utf8');
        return load(content);
    }

    export async function getProfileFromQuestion(profile: Profile, regions: string[]): Promise<Profile> {
        const mark = (source: string) => {
            if (source) {
                const subStr = source.slice(-4);
                return `***********${subStr}`;
            }
        };
        const markedAccountId = mark(profile.account.id);
        const markedaccessKeyId = mark(profile.credentials.accessKeyId);
        const markedAccessKeySecret = mark(profile.credentials.accessKeySecret);
        const questions = [
            {
                type: 'input',
                name: 'accountId',
                message: 'Account Id',
                default: markedAccountId
            },
            {
                type: 'input',
                name: 'accessKeyId',
                message: 'Access Key Id',
                default: markedaccessKeyId
            },
            {
                type: 'input',
                name: 'accessKeySecret',
                message: 'Access Key Secret',
                default: markedAccessKeySecret
            },
            {
                type: 'list',
                name: 'region',
                message: 'Default region name',
                choices: regions,
                default: profile.region
            }
        ];

        const { accountId, accessKeyId, accessKeySecret, region } = await prompt(questions);
        if (accountId !== markedAccountId) {
            profile.account.id = accountId;
        }
        if (accessKeyId !== markedaccessKeyId) {
            profile.credentials.accessKeyId = accessKeyId;
        }
        if (accessKeySecret !== markedAccessKeySecret) {
            profile.credentials.accessKeySecret = accessKeySecret;
        }

        profile.region = region;

        return profile;
    }

    export function getProfileFromCmd(opts: CmdOptions): Profile {
        const profile: Profile = {
            account: { id: opts.accountId },
            credentials: {
                accessKeyId: opts.accessKeyId,
                accessKeySecret: opts.accessKeySecret,
                token: opts.token,
            },
            region: opts.region
        };
        return profile;
    }

    export async function saveProfile(profilePath: string, profile: Profile): Promise<void> {
        const path = getProfilePath(profilePath);
        await ensureFile(path);
        await writeFile(path, dump(profile));
    }

    export async function getProfile(profilePath: string, regions: string[], opts: CmdOptions): Promise<Profile> {
        const initProfile = { account: { id: '' }, credentials: { accessKeyId: '', accessKeySecret: '' }, region: '' };
        let profile = await getProfileFromFile(profilePath) || initProfile;

        if (opts.accessKeyId && opts.accessKeySecret) {
            const cmdProfile = getProfileFromCmd(opts);
            profile = merge(profile, cmdProfile);
        } else {
            profile = await getProfileFromQuestion(profile, regions);
        }

        await saveProfile(profilePath, profile);
        return profile;
    }

    export async function promptForProfile(profilePath: string, regions: string[]): Promise<Profile> {
        const initProfile = { account: { id: '' }, credentials: { accessKeyId: '', accessKeySecret: '' }, region: '' };
        let profile = await getProfileFromFile(profilePath) || initProfile;
        profile = await getProfileFromQuestion(profile, regions);
        await saveProfile(profilePath, profile);
        return profile;
    }
}
