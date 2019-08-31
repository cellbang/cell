import { resolve } from 'path';
import { existsSync, copy, readJSON, writeJSON } from 'fs-extra';
const inquirer = require('inquirer');
import request = require('request-promise');
import { templates } from './templates';
import { spawnSync } from 'child_process';
import { HookExecutor } from '../hook/hook-executor';
const chalk = require('chalk');

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

const SEARCH_TEMPLATE_REPO_URI = 'https://api.github.com/search/repositories?q=topic:malagu-template&sort=stars&order=desc';

const PLACEHOLD = '{{ templatePath }}';

export interface Template {
    name: string;
    location: string;
}

export class InitManager {

    protected source: any[];
    protected location: string;
    constructor(protected readonly context: any) {

    }

    async output(): Promise<void> {
        await this.checkOutputDir();
        await this.selectTemplate();
        await this.doOutput();
    }

    async render(): Promise<void> {
        const packageJsonPath = resolve(this.outputDir, 'package.json');
        const packageJson = await readJSON(packageJsonPath, { encoding: 'utf8' });
        packageJson.name = this.context.name;
        await writeJSON(packageJsonPath, packageJson, { encoding: 'utf8', spaces: 2 });
    }

    async install(): Promise<void> {
        spawnSync('yarn', ['install'], { cwd: this.outputDir, stdio: 'inherit' });
    }

    async executeHooks(): Promise<void> {
        process.chdir(this.outputDir);
        await new HookExecutor().executeInitHooks();
    }

    protected get outputDir(): string {
        return resolve(process.cwd(), this.context.outputDir, this.context.name);
    }

    protected async checkOutputDir() {
        if (existsSync(this.outputDir)) {
            const answers = await inquirer.prompt([{
                name: 'overwrite',
                type: 'confirm',
                message: 'App already exists, overwrite the app'
            }]);
            if (!answers.overwrite) {
                process.exit(-1);
            }
        }
    }

    protected toOfficialTemplate(name: string, location: string) {
        return { name: `${name} ${chalk.italic.gray('Official')}`, value: location };
    }

    protected toThirdPartyTemplate(item: any) {
        return { name: `${item.name} ${chalk.italic.gray(item.stargazers_count + '⭑')}`, value: item.clone_url};
    }

    protected async selectTemplate(): Promise<void> {
        const answers = await inquirer.prompt([{
            name: 'location',
            type: 'autocomplete',
            message: 'Select a template to init',
            source: async (answersSoFar: any, input: string) => {
                if (!this.source) {
                    const options = {
                        uri: SEARCH_TEMPLATE_REPO_URI,
                        json: true,
                        timeout: 5000,
                        headers: {
                            'User-Agent': 'Malagu CLI'
                        }
                    };
                    const officialTemplates = Object.keys(templates).map(key => this.toOfficialTemplate(key, templates[key]));
                    try {
                        const { items } = await request(options);
                        const thirdPartyTemplates = items.map((item: any) => this.toThirdPartyTemplate(item));
                        this.source = [...officialTemplates, ...thirdPartyTemplates];
                    } catch (error) {
                        this.source = officialTemplates;
                        return this.source;
                    }
                }
                return this.source.filter(item => !input || item.name.toLowerCase().includes(input.toLowerCase()));
            }
        }]);
        this.location = answers.location;
    }

    protected isLocalTemplate() {
        return !this.location.startsWith('http');
    }

    protected get realLocation() {
        return this.location.replace(PLACEHOLD, resolve(__dirname, '..', '..', 'templates'));
    }

    protected async doOutput() {
        if (this.isLocalTemplate()) {
            await this.outputLocalTemplate();
        } else {
            this.outputRemoteTempate();
        }
    }
    protected async outputLocalTemplate() {
        await copy(this.realLocation, this.outputDir);
    }

    protected outputRemoteTempate() {
        spawnSync('git', ['clone', '--depth=1', this.location, this.outputDir], { stdio: 'inherit' });
    }
}
