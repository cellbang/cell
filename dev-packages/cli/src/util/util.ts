import { ApplicationPackage, CliContext } from '@malagu/cli-common';
import { installRuntimeIfNeed, Runtimes } from '@malagu/cli-runtime';
import { Framework } from '@malagu/frameworks';
const minimist = require('minimist');
import * as ora from 'ora';
import { Command } from 'commander';
import { Settings } from '@malagu/cli-common';

export async function initRuntime(settings: Settings, framework?: Framework) {
    const options = minimist(process.argv.slice(2));
    const mode = getMode(options, settings);
    const pkg = ApplicationPackage.create({ projectPath: process.cwd() , mode });
    let runtime = pkg.rootComponentPackage.malaguComponent?.runtime;
    runtime = runtime || settings.defaultRuntime;
    if (runtime) {
        await installRuntimeIfNeed(runtime);
    } else {
        if (framework) {
            runtime = framework.useRuntime;
            if (runtime && runtime !== Runtimes.empty) {
                await installRuntimeIfNeed(runtime);
            }
        }
    }
    return runtime;

}

export async function loadContext(program: Command, spinner: ora.Ora, settings: Settings, framework?: Framework, runtime?: string): Promise<CliContext> {
    const options = minimist(process.argv.slice(2));
    const args: string[] = options._;
    const mode = getMode(options, settings);
    const targets = getTargets(options);
    const prod = options.p || options.prod;
    return CliContext.create(program, { args, targets, mode, prod, dev: isDev(args, settings), spinner, runtime, framework });
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

function getMode(options: any, settings: Settings) {
    const mode = getArrayOptions(options, 'mode', 'm');
    if (!settings.modeCommands) {
        return mode;
    }

    const commandMode: string[] = [];
    for (const key of Object.keys(settings.modeCommands)) {
        if (includesCommand(options._, settings.modeCommands[key])) {
            commandMode.push(key);
        }
    }
    return [...commandMode, ...mode.filter((m: any) => commandMode.indexOf(m) === -1)];
}

export function includesCommand(args: string[], commands: string[] = []): boolean {
    if (args.length === 0) {
        return false;
    }
    for (const command of commands) {
        if (args.includes(command)) {
            return true;
        }
    }
    return false;
}

function isDev(args: string[], settings: Settings) {
    return includesCommand(args, settings.serveCommand ? [ settings.serveCommand ] : []);
}

function getTargets(options: any) {
    return getArrayOptions(options, 'targets', 't');
}

