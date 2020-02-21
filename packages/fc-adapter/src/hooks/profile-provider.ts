import { homedir } from 'os';
import { resolve } from 'path';
import { existsSync, readFile, ensureFile, writeFile } from 'fs-extra';
import { prompt } from 'inquirer';
const yaml = require('js-yaml');
const dotenv = require('dotenv').config();

export interface Profile {
    accountId: string;
    accessKeyId: string;
    accessKeySecret: string;
    defaultRegion: string;
    protocol: string;
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
        return profile.accessKeyId !== undefined && profile.accessKeySecret !== undefined && profile.accountId !== undefined;
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

    protected extractProfile(endpoint: string) {
        return {
            accountId: this.extract(/^https?:\/\/([^.]+)\..+$/, endpoint),
            defaultRegion: this.extract(/^https?:\/\/[^.]+\.([^.]+)\..+$/, endpoint),
            protocol: this.extractProtocol(endpoint)
        };
    }

    protected extractProtocol(endpoint: string) {
        return endpoint.startsWith('https') ? 'https' : 'http';
    }

    protected getProfilePath() {
        return resolve(homedir(), '.fcli', 'config.yaml');
    }

    protected async getProfileFromDotEnv() {
        const profile: Profile = <Profile>{};
        if (dotenv) {
            if (dotenv.error) {
                return profile;
            }

            const parsed = dotenv.parsed;

            profile.accountId = parsed['ACCOUNT_ID'];
            profile.defaultRegion = parsed['DEFAULT_REGION'];
            profile.defaultRegion = parsed['REGION'];
            profile.accessKeyId = parsed['ACCESS_KEY_ID'];
            profile.accessKeySecret = parsed['ACCESS_KEY_SECRET'];

        }

        return profile;
    }

    protected async getProfileFromFile(): Promise<Profile> {
        const profilePath = this.getProfilePath();
        const isExists = existsSync(profilePath);
        if (!isExists) {
            return <Profile>{};
        }

        let profile: Profile;

        const profContent = await readFile(profilePath, 'utf8');
        const profYml = yaml.safeLoad(profContent);

        profile = <Profile>{
            accessKeyId: profYml.access_key_id,
            accessKeySecret: profYml.access_key_secret
        };

        if (profYml.endpoint) {
            profile = { ...this.extractProfile(profYml.endpoint), ...this.cleanObject(profile) };
        }

        return profile;
    }

    protected async getProfileFromEnv(): Promise<Profile> {
        return <Profile>{
            accountId: process.env.ACCOUNT_ID,
            defaultRegion: process.env.REGION || process.env.DEFAULT_REGION,
            accessKeyId: process.env.ACCESS_KEY_ID,
            accessKeySecret: process.env.ACCESS_KEY_SECRET
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
        const markedAccessKeyId = this.mark(profile.accessKeyId);
        const markedAccessKeySecret = this.mark(profile.accessKeySecret);
        const questions = [
            {
                type: 'input',
                name: 'accountId',
                message: 'Aliyun Account ID',
                default: profile.accountId
            },
            {
                type: 'input',
                name: 'accessKeyId',
                message: 'Aliyun Access Key ID',
                default: markedAccessKeyId
            },
            {
                type: 'input',
                name: 'accessKeySecret',
                message: 'Aliyun Access Key Secret',
                default: markedAccessKeySecret
            },
            {
                type: 'list',
                name: 'defaultRegion',
                message: 'Default region name',
                choices: ['cn-qingdao', 'cn-beijing', 'cn-zhangjiakou',
                    'cn-hangzhou', 'cn-shanghai', 'cn-shenzhen', 'cn-huhehaote',
                    'cn-hongkong', 'ap-southeast-1', 'ap-southeast-2',
                    'ap-northeast-1', 'us-west-1', 'us-east-1',
                    'eu-central-1', 'ap-south-1'],
                default: profile.defaultRegion
            }
        ];

        const newProfile = await prompt(questions);
        if (newProfile.accessKeyId === markedAccessKeyId) {
            newProfile.accessKeyId = profile.accessKeyId;
        }
        if (newProfile.accessKeySecret === markedAccessKeySecret) {
            newProfile.accessKeySecret = profile.accessKeySecret;
        }

        const profilePath = this.getProfilePath();
        const isExists = existsSync(profilePath);

        let profYml;

        if (isExists) {
            const profContent = await readFile(profilePath, 'utf8');
            profYml = yaml.safeLoad(profContent, {
                schema: yaml.JSON_SCHEMA
            });
            profYml.endpoint = `https://${newProfile.accountId}.${newProfile.defaultRegion}.fc.aliyuncs.com`;
            profYml.access_key_id = newProfile.accessKeyId;
            profYml.access_key_secret = newProfile.accessKeySecret;
            profYml.sls_endpoint = `${newProfile.defaultRegion}.log.aliyuncs.com`;
        } else {
            profYml = {
                endpoint: `https://${newProfile.accountId}.${newProfile.defaultRegion}.fc.aliyuncs.com`,
                api_version: '2016-08-15',
                access_key_id: newProfile.accessKeyId,
                access_key_secret: newProfile.accessKeySecret,
                security_token: '',
                debug: false,
                sls_endpoint: `${newProfile.defaultRegion}.log.aliyuncs.com`,
            };
            await ensureFile(profilePath);
        }

        await writeFile(profilePath, yaml.dump(profYml));
    }

}
