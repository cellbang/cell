import { resolve } from 'path';
import { existsSync, copy, readFile, writeFile } from 'fs-extra';
const inquirer = require('inquirer');
import { templates } from './runtimes';
import uninstall from '../uninstall/uninstall';
import { spawnSync } from 'child_process';
import { ContextUtils, CliContext, getPackager, HookExecutor, PathUtil, CommandUtil } from '@malagu/cli-common';
import * as ora from 'ora';
const chalk = require('chalk');
import { basename, join } from 'path';
import { RuntimeUtil } from '../util';
const leven = require('leven');

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

const PLACEHOLD = '{{ runtimePath }}';

const remoteRuntimeRegex = /^(https?:|git@)/i;

export interface Runtime {
    name: string;
    location: string;
}

export interface InstallOptions {
    runtime?: string;
    alias?: string;
}

export class InstallManager {

    protected source: any[];
    protected runtimeName: string;
    protected location: string;
    protected cliContext: CliContext;
    constructor(protected readonly opts: InstallOptions) {

    }

    async output(): Promise<void> {
        await this.selectRuntime();
        await this.checkOutputDir();
        await this.doOutput();
    }

    async render(): Promise<void> {
        const pkg = require('../../package.json');
        const packageJsonPath = resolve(this.outputDir, 'package.json');
        let packageContent = await readFile(packageJsonPath, { encoding: 'utf8' });
        packageContent = packageContent.replace('{{ version }}', pkg.version);
        await writeFile(packageJsonPath, packageContent);
    }

    async install(): Promise<void> {
        console.log(chalk`The {yellow ${this.runtimeName}} runtime is being installed...`);
        const pkg = CommandUtil.getPkg(undefined, this.outputDir);
        await getPackager(pkg.rootComponentPackage.malaguComponent?.packager, this.outputDir).install(this.outputDir, {});
    }

    async executeHooks(): Promise<void> {
        const outputDir = this.outputDir;
        const initContext = await ContextUtils.createInitContext(await this.getCliContext());
        await new HookExecutor().executeInitHooks(initContext);
        console.log(chalk`{bold.green Success!} Installed "${ this.runtimeName }" runtime in {bold.blue ${outputDir}}.`);
    }

    protected async getCliContext(): Promise<CliContext> {
        if (!this.cliContext) {
            this.cliContext = await RuntimeUtil.initRuntimeAndLoadContext(this.outputDir);
            this.cliContext.alias = this.opts.alias;
        }
        return this.cliContext;
    }

    protected get outputDir(): string {
        return PathUtil.getRuntimePath(this.opts.alias || this.runtimeName);
    }

    protected async checkOutputDir(): Promise<void> {
        if (existsSync(this.outputDir)) {
            const answers = await inquirer.prompt([{
                name: 'overwrite',
                type: 'confirm',
                message: 'Runtime already exists, overwrite the runtime'
            }]);
            if (!answers.overwrite) {
                process.exit(0);
            }
            await uninstall({ runtime: this.opts.alias || this.runtimeName });
        }
    }

    protected toOfficialRuntime(name: string, location: string): any {
        return { name: `${name} ${chalk.italic.gray('Official')}`, value: { location, name} };
    }

    protected toThirdPartyRuntime(item: any): any {
        return { name: `${item.name} ${chalk.italic.gray(item.stargazers_count + '⭑')}`, value: { location: item.clone_url, name: item.name }};
    }

    protected async selectRuntime(): Promise<void> {
        const { runtime } = this.opts;
        if (runtime) {
            this.runtimeName = runtime;
            if (remoteRuntimeRegex.test(runtime)) {
                this.location = runtime;
            } else {
                Object.keys(templates).forEach(key => {
                    if (key === runtime) {
                        this.location = templates[key];
                        return false;
                    }
                });
            }
            if (!this.location && runtime.startsWith('.')) {
                this.location = join(process.cwd(), runtime);
                this.runtimeName = basename(this.location);
            }

            if (!this.location) {
                let suggestion: string = '';
                Object.keys(templates).forEach(key => {
                    const isBestMatch = leven(key, runtime) < leven(suggestion, runtime);
                    if (isBestMatch) {
                        suggestion = key;
                    }
                });

                if (suggestion) {
                    console.log(`  "${runtime}" runtime not found. ${chalk.yellow(`Did you mean ${chalk.green(suggestion)}?`)}`);
                } else {
                    console.error(`malagu error - "${runtime}" runtime not found`);
                }
                process.exit(-1);
            }
            return;
        }
        const spinner = ora({ text: 'loading...', discardStdin: false }).start();
        const answers = await inquirer.prompt([{
            name: 'item',
            type: 'autocomplete',
            pageSize: 12,
            message: 'Select a runtime to install',
            source: async (answersSoFar: any, input: string) => {
                if (!this.source) {
                    const officialTemplates = Object.keys(templates).map(key => this.toOfficialRuntime(key, templates[key]));
                    this.source = officialTemplates;
                    spinner.stop();
                }
                return this.source.filter(item => !input || item.name.toLowerCase().includes(input.toLowerCase()));
            }
        }]);
        this.runtimeName = answers.item.name;
        this.location = answers.item.location;
    }

    protected get realLocation() {
        return this.location.replace(PLACEHOLD, resolve(__dirname, '..', '..', 'runtimes'));
    }

    protected async doOutput(): Promise<void> {
        if (remoteRuntimeRegex.test(this.location)) {
            this.outputRemoteRuntime();
        } else {
            await this.outputLocalRuntime();
        }
    }
    protected async outputLocalRuntime(): Promise<void> {
        await copy(this.realLocation, this.outputDir);
    }

    protected outputRemoteRuntime(): void {
        spawnSync('git', ['clone', '--depth=1', this.location, this.outputDir], { stdio: 'inherit' });
    }
}
