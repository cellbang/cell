import { Framework } from '@malagu/frameworks';
const minimist = require('minimist');
import * as ora from 'ora';
import { SettingsUtil, Settings } from '../settings';
import { ApplicationPackage } from '../package';
import { CliContext } from '../context';

export namespace CommandUtil {

    export function getPkg(settings: Settings = SettingsUtil.getSettings(), projectPath = process.cwd()) {
        const options = minimist(process.argv.slice(2));
        const mode = getMode(options, settings);
        return ApplicationPackage.create({ projectPath, mode, dev: isDev(options._, settings) });
    }

    export async function loadContext(settings: Settings, framework?: Framework, runtime?: string, projectPath?: string, spinner?: ora.Ora): Promise<CliContext> {
        const options = minimist(process.argv.slice(2));
        const args: string[] = options._;
        const mode = getMode(options, settings);
        const targets = getTargets(options);
        const prod = options.p || options.prod;
        return CliContext.create({ args, targets, mode, prod, dev: isDev(args, settings), spinner, runtime, framework });
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
        return includesCommand(args, settings.serveCommand ? [settings.serveCommand] : []);
    }

    function getTargets(options: any) {
        return getArrayOptions(options, 'targets', 't');
    }

    export function getCommandByName(ctx: CliContext, name: string) {
        const { program } = ctx;
        for (const command of program.commands) {
            if (command.name() === name) {
                return command;
            }
        }
    }

    export function getConfigCommand(ctx: CliContext) {
        const { program } = ctx;
        for (const command of program.commands) {
            if (command.name() === 'config') {
                return command;
            }
        }
    }
}
