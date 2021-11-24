import { ApplicationPackage, CliContext, getSettings } from '@malagu/cli-common';
import { installRuntimeIfNeed, Runtimes } from '@malagu/cli-runtime';
import { FrameworkUtils, frameworks } from '@malagu/frameworks';
const minimist = require('minimist');
import * as ora from 'ora';
import { Command } from 'commander';

export async function initRuntime() {
    const options = minimist(process.argv.slice(2));
    const mode = getMode(options);
    const pkg = ApplicationPackage.create({ projectPath: process.cwd() , mode });
    let runtime = pkg.rootComponentPackage.malaguComponent?.runtime;
    runtime = runtime || getSettings().defaultRuntime;
    if (runtime) {
        await installRuntimeIfNeed(runtime);
    } else {
        const framework = await FrameworkUtils.detect(frameworks);
        if (framework) {
            runtime = framework.useRuntime;
            if (runtime && runtime !== Runtimes.empty) {
                await installRuntimeIfNeed(runtime);
            }
        }
    }
    return runtime;

}

export async function loadContext(program: Command, spinner: ora.Ora, runtime?: string): Promise<CliContext> {
    const options = minimist(process.argv.slice(2));
    const mode = getMode(options);
    const targets = getTargets(options);
    const prod = options.p || options.prod;
    return CliContext.create(program, { args: options._, targets, mode, prod, dev: isDev(options), spinner, runtime });
}

function getArrayOptions(options: any, prop: string, shortProp: string): string[] {
    const value = options[prop] || options[shortProp];
    if (Array.isArray(value)) {
        return value.reduce((accumulator, currentValue) => [...accumulator, ...currentValue.split(',')], []);
    } else if (typeof value === 'string') {
        return value.split(',');
    }
    return [];
}

function getMode(options: any) {
    const mode = getArrayOptions(options, 'mode', 'm');

    let fixedMode: string[] = [];
    if (options._.includes('serve')) {
        fixedMode = ['local'];
    } else if (options._.includes('build') || options._.includes('deploy')) {
        fixedMode = ['remote'];
    }
    return [...fixedMode, ...mode.filter((m: any) => fixedMode.indexOf(m) === -1)];
}

function isDev(options: any) {
    return options._.includes('serve');
}

function getTargets(options: any) {
    return getArrayOptions(options, 'targets', 't');
}

