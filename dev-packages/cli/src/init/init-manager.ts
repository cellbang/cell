import { resolve } from 'path';
import { existsSync, copy, readJSON, writeJSON } from 'fs-extra';
const inquirer = require('inquirer');
import { templates } from './templates';
import { spawnSync } from 'child_process';
import { ContextUtils, CliContext, getPackager, HookExecutor, CommandUtil } from '@malagu/cli-common';
import * as ora from 'ora';
const chalk = require('chalk');
import { ok } from 'assert';
import { RuntimeUtil } from '@malagu/cli-runtime';

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

const PLACEHOLD = '{{ templatePath }}';

const remoteTemplateRegex = /^(https?:|git@)/i;

export interface Template {
    name: string;
    location: string;
}

export interface InitOptions {
    name?: string;
    template?: string;
    outputDir: string;
}

export class InitManager {

    protected source: any[];
    protected templateName: string;
    protected location: string;
    protected cliContext: CliContext;
    constructor(protected readonly opts: InitOptions) {

    }

    async output(): Promise<void> {
        await this.selectTemplate();
        await this.checkOutputDir();
        await this.doOutput();
    }

    async render(): Promise<void> {
        const packageJsonPath = resolve(this.outputDir, 'package.json');
        const packageJson = await readJSON(packageJsonPath, { encoding: 'utf8' });
        packageJson.name = this.opts.name;
        await writeJSON(packageJsonPath, packageJson, { encoding: 'utf8', spaces: 2 });
    }

    async install(): Promise<void> {
        const pkg = CommandUtil.getPkg(undefined, this.outputDir);
        await getPackager(pkg.rootComponentPackage.malaguComponent?.packager, this.outputDir).install({}, this.outputDir);
    }

    async executeHooks(): Promise<void> {
        const outputDir = this.outputDir;
        const initContext = await ContextUtils.createInitContext(await this.getCliContext());
        await new HookExecutor().executeHooks(initContext, 'initHooks');
        console.log(chalk`{bold.green Success!} Initialized "${ this.templateName }" example in {bold.blue ${outputDir}}.`);
        process.exit(0);
    }

    protected async getCliContext(): Promise<CliContext> {
        if (!this.cliContext) {
            this.cliContext = await RuntimeUtil.initRuntimeAndLoadContext(this.outputDir);
            this.cliContext.name = this.opts.name;
            this.cliContext.outputDir = this.opts.outputDir;
        }
        return this.cliContext;
    }

    protected get outputDir(): string {
        return resolve(process.cwd(), this.opts.outputDir, this.opts.name!);
    }

    protected async checkOutputDir(): Promise<void> {
        if (existsSync(this.outputDir)) {
            const answers = await inquirer.prompt([{
                name: 'overwrite',
                type: 'confirm',
                message: 'App already exists, overwrite the app'
            }]);
            if (!answers.overwrite) {
                process.exit(0);
            }
        }
    }

    protected toOfficialTemplate(name: string, location: string): any {
        return { name: `${name} ${chalk.italic.gray('Official')}`, value: { location, name} };
    }

    protected toThirdPartyTemplate(item: any): any {
        return { name: `${item.name} ${chalk.italic.gray(item.stargazers_count + '⭑')}`, value: { location: item.clone_url, name: item.name }};
    }

    protected async selectTemplate(): Promise<void> {
        const { name, template } = this.opts;
        if (template) {
            this.templateName = template;
            if (remoteTemplateRegex.test(template)) {
                this.location = template;
            } else {
                Object.keys(templates).forEach(key => {
                    if (key === template) {
                        this.location = templates[key];
                    }
                });
                ok(this.location, `"${template}" template not found`);
            }
            return;
        }
        const spinner = ora({ text: 'loading...', discardStdin: false }).start();
        const answers = await inquirer.prompt([{
            name: 'item',
            type: 'autocomplete',
            pageSize: 12,
            message: 'Select a template to init',
            source: async (answersSoFar: any, input: string) => {
                if (!this.source) {
                    const officialTemplates = Object.keys(templates).map(key => this.toOfficialTemplate(key, templates[key]));
                    this.source = officialTemplates;
                    spinner.stop();
                }
                return this.source.filter(item => !input || item.name.toLowerCase().includes(input.toLowerCase()));
            }
        }]);
        this.templateName = answers.item.name;
        this.opts.name = name || answers.item.name;
        this.location = answers.item.location;
    }

    protected get realLocation() {
        return this.location.replace(PLACEHOLD, resolve(__dirname, '..', '..', 'templates'));
    }

    protected async doOutput(): Promise<void> {
        if (remoteTemplateRegex.test(this.location)) {
            this.outputRemoteTempate();
        } else {
            await this.outputLocalTemplate();
        }
    }
    protected async outputLocalTemplate(): Promise<void> {
        await copy(this.realLocation, this.outputDir);
    }

    protected outputRemoteTempate(): void {
        spawnSync('git', ['clone', '--depth=1', this.location, this.outputDir], { stdio: 'inherit' });
    }
}
