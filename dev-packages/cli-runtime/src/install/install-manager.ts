import { existsSync, copy, readFile, writeFile } from 'fs-extra';
import { prompts } from 'prompts';
import { templates } from './runtimes';
import uninstall from '../uninstall/uninstall';
import { CliContext } from '@celljs/cli-common/lib/context/context-protocol';
import { getPackager, spawnProcess } from '@celljs/cli-common/lib/packager/utils';
import { HookExecutor } from '@celljs/cli-common/lib/hook/hook-executor';
import { PathUtil } from '@celljs/cli-common/lib/utils/path-util';
import {CommandUtil } from '@celljs/cli-common/lib/utils/command-util';

import * as ora from 'ora';
const chalk = require('chalk');
import { basename, join, resolve } from 'path';
import { RuntimeUtil } from '../util';
const leven = require('leven');

const PLACEHOLD = '{{ runtimePath }}';

const remoteRuntimeRegex = /^(https?:|git@)/i;

export interface Runtime {
    name: string;
    location: string;
}

export interface InstallOptions {
    runtime?: string;
    alias?: string;
    quiet?: boolean;
    overwrite?: boolean;
    forceInstallingComponent?: boolean;
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
        packageContent = packageContent.replace(/{{\s*version\s*}}/g, pkg.version);
        if (this.opts.forceInstallingComponent) {
            const runtimePkg = JSON.parse(packageContent);
            if (runtimePkg.cell?.components || runtimePkg.cell?.devComponents) {
                const { components, devComponents } = runtimePkg.cell;
                runtimePkg.dependencies = { ...runtimePkg.dependencies, ...components };
                runtimePkg.devDependencies = { ...runtimePkg.devDependencies, ...devComponents };
                packageContent = JSON.stringify(runtimePkg, undefined, 2);
            }
        }
        await writeFile(packageJsonPath, packageContent);
    }

    async install(): Promise<void> {
        if (this.opts.forceInstallingComponent) {
            if (!this.opts.quiet) {
                console.log(chalk`The {yellow.bold ${this.runtimeName}} runtime is being installed...`);
            }
            const pkg = CommandUtil.getPkg(undefined, this.outputDir);
            await getPackager(pkg.rootComponentPackage.cellComponent?.packager, this.outputDir).install({ stdio: this.opts.quiet ? 'pipe' : undefined }, this.outputDir);
        }
    }

    async executeHooks(): Promise<void> {
        const outputDir = this.outputDir;
        const initContext = await this.getCliContext();
        await new HookExecutor().executeInitHooks(initContext);
        if (!this.opts.quiet) {
            console.log(chalk`{bold.green Success!} Installed "${ this.runtimeName }" runtime in {bold.blue ${outputDir}}.`);
        }
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
            if (!this.opts.overwrite) {
                // eslint-disable-next-line @typescript-eslint/await-thenable
                await prompts.confirm({
                    name: 'overwrite',
                    type: 'confirm',
                    message: 'Runtime already exists, overwrite the runtime',
                    onState: async ({ value }) => {
                        if (value !== true) {
                            process.exit(0);
                        }
                    }
                });

            }
            await uninstall({ runtime: this.opts.alias || this.runtimeName });
        }
    }

    protected toOfficialRuntime(name: string, location: string): any {
        return { title: `${name} ${chalk.italic.gray('Official')}`, value: { location, name} };
    }

    protected toThirdPartyRuntime(item: any): any {
        return { title: `${item.name} ${chalk.italic.gray(item.stargazers_count + '⭑')}`, value: { location: item.clone_url, name: item.name }};
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
                let suggestion = '';
                Object.keys(templates).forEach(key => {
                    const isBestMatch = leven(key, runtime) < leven(suggestion, runtime);
                    if (isBestMatch) {
                        suggestion = key;
                    }
                });

                if (suggestion) {
                    console.log(`  "${runtime}" runtime not found. ${chalk.yellow(`Did you mean ${chalk.green(suggestion)}?`)}`);
                } else {
                    console.error(`cell error - "${runtime}" runtime not found`);
                }
                process.exit(-1);
            }
            return;
        }
        const spinner = ora({ text: 'loading...', discardStdin: false }).start();
        const officialTemplates = Object.keys(templates).map(key => this.toOfficialRuntime(key, templates[key]));
        const choices = officialTemplates;
                    spinner.stop();
        const answer = await prompts.autocomplete({
            name: 'runtime',
            type: 'autocomplete',
            limit: 12,
            message: 'Select a runtime to install',
            choices,
            suggest: async (input: string) => choices.filter(item => !input || item.title.toLowerCase().includes(input.toLowerCase()))
        });
        this.runtimeName = answer.name;
        this.location = answer.location;
    }

    protected get realLocation() {
        return this.location.replace(PLACEHOLD, resolve(__dirname, '..', '..', 'runtimes'));
    }

    protected async doOutput(): Promise<void> {
        if (remoteRuntimeRegex.test(this.location)) {
            await this.outputRemoteRuntime();
        } else {
            await this.outputLocalRuntime();
        }
    }
    protected async outputLocalRuntime(): Promise<void> {
        await copy(this.realLocation, this.outputDir);
    }

    protected outputRemoteRuntime(): Promise<any> {
        return spawnProcess('git', ['clone', '--depth=1', this.location, this.outputDir], { stdio: 'inherit' });
    }
}
