import { resolve, basename, relative, join } from 'path';
import { existsSync, copy, readFile, writeJSON } from 'fs-extra';
import { templates } from './templates';
import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import { getPackager, spawnProcess } from '@malagu/cli-common/lib/packager/utils';
import { HookExecutor } from '@malagu/cli-common/lib/hook/hook-executor';
import { CommandUtil } from '@malagu/cli-common/lib/utils/command-util';
import { prompts } from 'prompts';
import * as ora from 'ora';
const rimraf = require('rimraf');
const chalk = require('chalk');
import { ok } from 'assert';
import { RuntimeUtil } from '@malagu/cli-runtime';
const version = require('../../package.json').version;

const PLACEHOLD = '{{ templatePath }}';

const remoteTemplateRegex = /^(https?:|git@)/i;

export interface Template {
    name: string;
    location: string;
}

export interface InitOptions {
    template?: string;
    packager?: 'pnpm' | 'yarn' | 'npm';
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
        if (existsSync(packageJsonPath)) {
            let packageJsonStr = await readFile(packageJsonPath, { encoding: 'utf8' });
            packageJsonStr = packageJsonStr.replace(/{{\s*version\s*}}/g, version);
            const packageJson = JSON.parse(packageJsonStr);
            packageJson.name = basename(this.outputDir);
            await writeJSON(packageJsonPath, packageJson, { encoding: 'utf8', spaces: 2 });
        }
    }

    async install(): Promise<void> {
        const pkg = CommandUtil.getPkg(undefined, this.outputDir);
        const packager = this.opts.packager || pkg.rootComponentPackage.malaguComponent?.packager;

        await getPackager(packager, this.outputDir).install({}, this.outputDir);
    }

    async executeHooks(): Promise<void> {
        const outputDir = this.outputDir;
        const initContext = await this.getCliContext();
        await new HookExecutor().executeHooks(initContext, 'initHooks');
        console.log(chalk`{bold.green Success!} Initialized "${ this.templateName }" example in {bold.blue ${outputDir}}.`);
        process.exit(0);
    }

    protected async getCliContext(): Promise<CliContext> {
        if (!this.cliContext) {
            this.cliContext = await RuntimeUtil.initRuntimeAndLoadContext(this.outputDir);
            this.cliContext.location = this.realLocation;
            this.cliContext.outputDir = this.outputDir;
        }
        return this.cliContext;
    }

    protected get outputDir(): string {
        return resolve(process.cwd(),  this.opts.outputDir ? this.opts.outputDir : this.location.split('/').pop()!.replace('.git', ''));
    }

    protected async checkOutputDir(): Promise<void> {
        if (existsSync(this.outputDir)) {
            // eslint-disable-next-line @typescript-eslint/await-thenable
            await prompts.confirm({
                name: 'remove',
                type: 'confirm',
                message: `App already exists, remove the app (dir: ${join(relative(process.cwd(), this.outputDir))})`,
                onState: ({ value }) => {
                    if (value === true) {
                        rimraf.sync(this.outputDir);
                    } else {
                        process.exit(0);
                    }
                }
            });
        }
    }

    protected toOfficialTemplate(name: string, location: string): any {
        return { title: `${name} ${chalk.italic.gray('Official')}`, value: { location, name} };
    }

    protected toThirdPartyTemplate(item: any): any {
        return { title: `${item.name} ${chalk.italic.gray(item.stargazers_count + '⭑')}`, value: { location: item.clone_url, name: item.name }};
    }

    protected async selectTemplate(): Promise<void> {
        const { template } = this.opts;
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
        const officialTemplates = Object.keys(templates).map(key => this.toOfficialTemplate(key, templates[key]));
        const choices = officialTemplates;
        spinner.stop();
        const answer = await prompts.autocomplete({
            type: 'autocomplete',
            name: 'template',
            limit: 12,
            message: 'Select a template to init',
            choices,
            suggest: async input => choices.filter(item => !input || item.title.toLowerCase().includes(input.toLowerCase()))
        });
        this.templateName = answer.name;
        this.location = answer.location;
    }

    protected get realLocation() {
        return this.location.replace(PLACEHOLD, resolve(__dirname, '..', '..', 'templates'));
    }

    protected async doOutput(): Promise<void> {
        if (remoteTemplateRegex.test(this.location)) {
            await this.outputRemoteTempate();
        } else {
            await this.outputLocalTemplate();
        }
    }
    protected async outputLocalTemplate(): Promise<void> {
        await copy(this.realLocation, this.outputDir);
    }

    protected outputRemoteTempate(): Promise<any> {
        const dir = this.opts.outputDir ? [ this.opts.outputDir ] : [];
        return spawnProcess('git', [ 'clone', '--depth=1', this.location, ...dir ], { stdio: 'inherit' });
    }
}
