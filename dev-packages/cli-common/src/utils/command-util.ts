import { Framework } from '@malagu/frameworks/lib/detector/detector-protocol';
const minimist = require('minimist');
import * as ora from 'ora';
import { Settings } from '../settings/settings-protocol';
import { SettingsUtil } from '../settings/settings-util';
import { ConfigUtil } from './config-util';
import { ApplicationPackage } from '../package/application-package';
import { CliContext } from '../context/context-protocol';
import { BACKEND_TARGET, FRONTEND_TARGET } from '../constants';
import { spawnProcess } from '../packager/utils';

export enum CommandType {
    ServeCommand = 'serveCommand',
    BuildCommand = 'buildCommand',
    DeployCommand = 'deployCommand',
    CompileCommand = 'compileCommand'
}

export enum CommandStage {
    on = 'on',
    before = 'before',
    after = 'after'
}
export namespace CommandUtil {

    export function getPkg(settings: Settings = SettingsUtil.getSettings(), projectPath = process.cwd()) {
        const options = minimist(process.argv.slice(2));
        const mode = getMode(options, settings);
        const propsDir = getPropsDir(options);
        const propsFile = getPropsFile(options);
        return ApplicationPackage.create({ projectPath, mode, dev: isDev(options._, settings), settings, propsDir, propsFile });
    }

    export async function loadContext(settings: Settings, framework?: Framework, runtime?: string, projectPath?: string, spinner?: ora.Ora): Promise<CliContext> {
        const options = minimist(process.argv.slice(2));
        const args: string[] = options._;
        const mode = getMode(options, settings);
        const port = getPort(options);
        const targets = getTargets(options);
        const prod = options.p || options.prod;
        const propsDir = getPropsDir(options);
        const propsFile = getPropsFile(options);
        const skipAutoInstall = getSkipAutoInstall(options);
        return CliContext.create({ args, targets, mode, prod, dev: isDev(args, settings), port, spinner, runtime, framework, settings, propsFile, propsDir, skipAutoInstall });
    }

    function getArrayOptions(options: any, prop: string, shortProp?: string): string[] {
        const value = options[prop] || shortProp && options[shortProp];
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

    function getPort(options: any) {
        return options['port'] || options['p'];
    }

    function getPropsDir(options: any) {
        return getArrayOptions(options, 'props-dir').pop();
    }

    function getPropsFile(options: any) {
        return getArrayOptions(options, 'props-file').pop();
    }

    function getSkipAutoInstall(options: any) {
        return options['skip-auto-install'];
    }

    export function getCommandByName(ctx: CliContext, name: string) {
        const { program } = ctx;
        for (const command of program.commands) {
            if (command.name() === name) {
                return command;
            }
        }
    }

    export function getBuildCommand(ctx: CliContext) {
        return getCommandByName(ctx, 'build');

    }

    export function getDeployCommand(ctx: CliContext) {
        return getCommandByName(ctx, 'deploy');
    }

    export function getServeCommand(ctx: CliContext) {
        return getCommandByName(ctx, 'serve');
    }

    export function getConfigCommand(ctx: CliContext) {
        return getCommandByName(ctx, 'config');
    }

    export async function executeCommand(ctx: CliContext, commandType: string, commandStage: string = CommandStage.on,
        renderer = async (command: string, target: string) => command) {
        const backendConfig = ConfigUtil.getBackendConfig(ctx.cfg);
        const frontendConfig = ConfigUtil.getFrontendConfig(ctx.cfg);

        const commands = [];

        const cmd = commandStage === CommandStage.on ? commandType : `${commandType}:${commandStage}`;
        let frontendCommand = frontendConfig[cmd];
        if (frontendCommand) {
            frontendCommand = await renderer(frontendCommand, FRONTEND_TARGET);
            commands.push(frontendCommand);
        }

        let backendCommand = backendConfig[cmd];
        if (backendCommand && backendCommand !== frontendCommand) {
            backendCommand = await renderer(backendCommand, BACKEND_TARGET);
            commands.push(backendCommand);
        }

        for (const c of commands) {
            if (c) {
                const args = c.split(/\s+/);
                await spawnProcess(args.shift()!, args, { stdio: 'inherit' });
            }
        }
    }
}
