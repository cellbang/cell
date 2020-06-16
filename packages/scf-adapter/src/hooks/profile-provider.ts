import { homedir } from 'os';
import { resolve } from 'path';
import { existsSync, readFile, ensureFile, writeFile } from 'fs-extra';
import { prompt } from 'inquirer';
const yaml = require('js-yaml');
const dotenv = require('dotenv').config();

export interface Profile {
    secretId: string;
    secretKey: string;
    defaultRegion: string;
}

export class ProfileProvider {

    async provide(quiet: boolean = false): Promise<Profile> {
        const profile = await this.getProfile();

        if (!quiet && !this.isAllRequiredExist(profile)) {
            await this.promptForProfile();
            return this.getProfile();
        }

        return profile;
    }

    protected async getProfile(): Promise<Profile> {
        return { ...await this.getProfileFromFile(), ...this.cleanObject(await this.getProfileFromEnv()), ...this.cleanObject(await this.getProfileFromDotEnv())};
    }

    protected isAllRequiredExist(profile: Profile) {
        return profile.secretKey !== undefined && profile.secretId !== undefined;
    }

    protected extract(regex: RegExp, endpoint: string) {
        const matchs = endpoint.match(regex);
        if (matchs) {
            return matchs[1];
        }
        return undefined;
    }

    protected cleanObject(target: any) {
        for (const key in target) {
            if (target.hasOwnProperty(key)) {
                const value = target[key];
                if (!value) {
                    delete target[key];
                }
            }
        }

        return target;
    }

    protected getProfilePath() {
        return resolve(homedir(), '.malagu', 'tencent', 'profile.yml');
    }

    protected async getProfileFromDotEnv() {
        const profile: Profile = <Profile>{};
        if (dotenv) {
            if (dotenv.error) {
                return profile;
            }

            const parsed = dotenv.parsed;

            profile.defaultRegion = parsed['DEFAULT_REGION'];
            profile.secretId = parsed['TENCENT_SECRET_ID'];
            profile.secretKey = parsed['TENCENT_SECRET_KEY'];

        }

        return profile;
    }

    protected async getProfileFromFile(): Promise<Profile> {
        const profilePath = this.getProfilePath();
        const isExists = existsSync(profilePath);
        if (!isExists) {
            return <Profile>{};
        }

        const profContent = await readFile(profilePath, 'utf8');
        const profYml = yaml.safeLoad(profContent);

        return profYml;
    }

    protected async getProfileFromEnv(): Promise<Profile> {
        return <Profile>{
            defaultRegion: process.env.REGION || process.env.DEFAULT_REGION,
            secretId: process.env.TENCENT_SECRET_ID,
            secretKey: process.env.TENCENT_SECRET_KEY
        };
    }

    protected mark(source: string) {
        if (source) {
            const subStr = source.slice(-4);
            return `***********${subStr}`;
        }
    }

    protected async promptForProfile(): Promise<void> {
        const profile = await this.getProfileFromFile();
        const markedSecretId = this.mark(profile.secretId);
        const markedSecretKey = this.mark(profile.secretKey);
        const questions = [
            {
                type: 'input',
                name: 'secretId',
                message: 'Tencent Secret Id',
                default: markedSecretId
            },
            {
                type: 'input',
                name: 'secretKey',
                message: 'Tencent Secret Key',
                default: markedSecretKey
            },
            {
                type: 'list',
                name: 'defaultRegion',
                message: 'Default region name',
                choices: ['ap-guangzhou', 'ap-shanghai', 'ap-beijing', 'ap-chengdu', 'ap-guangzhou-open', 'ap-hongkong',
                    'ap-mumbai', 'ap-shanghai-fsi', 'ap-shenzhen-fsi', 'ap-singapore', 'ap-tokyo', 'na-siliconvalley', 'na-toronto'],
                default: profile.defaultRegion
            }
        ];

        const newProfile = await prompt(questions);
        if (newProfile.secretId === markedSecretId) {
            newProfile.secretId = profile.secretId;
        }
        if (newProfile.secretKey === markedSecretKey) {
            newProfile.secretKey = profile.secretKey;
        }

        const profilePath = this.getProfilePath();
        const isExists = existsSync(profilePath);

        let profYml;

        if (isExists) {
            const profContent = await readFile(profilePath, 'utf8');
            profYml = yaml.safeLoad(profContent, {
                schema: yaml.JSON_SCHEMA
            });
            profYml.secretId = newProfile.secretId;
            profYml.secretKey = newProfile.secretKey;
            profYml.defaultRegion = newProfile.defaultRegion;
        } else {
            profYml = {
                secretId: newProfile.secretId,
                secretKey: newProfile.secretKey,
                defaultRegion: newProfile.defaultRegion
            };
            await ensureFile(profilePath);
        }

        await writeFile(profilePath, yaml.dump(profYml));
    }

}
