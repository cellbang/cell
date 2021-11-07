import { resolve } from 'path';
import { existsSync, copy, readFile, writeFile } from 'fs-extra';
const inquirer = require('inquirer');
import { templates } from './runtimes';
import uninstall from '../uninstall/uninstall';
import { spawnSync } from 'child_process';
import { ContextUtils, CliContext, getPackager, HookExecutor } from '@malagu/cli-common';
import * as ora from 'ora';
const chalk = require('chalk');
import { ok } from 'assert';
import { getRuntimePath } from '@malagu/cli-common/lib/util';
import { basename, join } from 'path';

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

const PLACEHOLD = '{{ runtimePath }}';

const remoteRuntimeRegex = /^(https?:|git@)/i;

export interface Runtime {
    name: string;
    location: string;
}

export class InstallManager {

    protected source: any[];
    protected runtimeName: string;
    protected location: string;
    protected cliContext: CliContext;
    constructor(protected readonly context: any) {

    }

    async output(): Promise<void> {
        await this.selectRuntime();
        await this.checkOutputDir();
        await this.doOutput();
    }

    async render(): Promise<void> {
        const packageJsonPath = resolve(this.outputDir, 'package.json');
        const packageContent = await readFile(packageJsonPath, { encoding: 'utf8' });
        await writeFile(packageJsonPath, packageContent);
    }

    async install(): Promise<void> {
        const ctx = await CliContext.create(this.context.program, {}, this.outputDir, true);
        await getPackager(ctx).install(this.outputDir, {});
    }

    async executeHooks(): Promise<void> {
        const outputDir = this.outputDir;
        const initContext = await ContextUtils.createInitContext(await this.getCliContext());
        await new HookExecutor().executeInitHooks(initContext);
        console.log(chalk`{bold.green Success!} Installed "${ this.runtimeName }" runtime in {bold.blue ${outputDir}}.`);
        process.exit(0);
    }

    protected async getCliContext(): Promise<CliContext> {
        if (!this.cliContext) {
            this.cliContext = await CliContext.create(this.context.program, {}, this.outputDir);
            this.cliContext.alias = this.context.alias;
        }
        return this.cliContext;
    }

    protected get outputDir(): string {
        return getRuntimePath(this.context.alias || this.runtimeName);
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
            await uninstall({ runtime: this.context.alias || this.runtimeName });
        }
    }

    protected toOfficialRuntime(name: string, location: string): any {
        return { name: `${name} ${chalk.italic.gray('Official')}`, value: { location, name} };
    }

    protected toThirdPartyRuntime(item: any): any {
        return { name: `${item.name} ${chalk.italic.gray(item.stargazers_count + '⭑')}`, value: { location: item.clone_url, name: item.name }};
    }

    protected async selectRuntime(): Promise<void> {
        const { runtime } = this.context;
        if (runtime) {
            this.runtimeName = runtime;
            if (remoteRuntimeRegex.test(runtime)) {
                this.location = runtime;
            } else {
                Object.keys(templates).forEach(key => {
                    if (key === runtime) {
                        this.location = templates[key];
                        return;
                    }
                });
            }
            if (!this.location && runtime.startsWith('.')) {
                this.location = join(process.cwd(), runtime);
                this.runtimeName = basename(this.location);
            }

            if (this.location) {
                ok(this.location, `"${runtime}" runtime not found`);
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
