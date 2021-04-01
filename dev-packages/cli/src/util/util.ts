import { CliContext } from '@malagu/cli-common';
const minimist = require('minimist');
const chalk = require('chalk');
import * as ora from 'ora';
import { CommanderStatic } from 'commander';

export function loadCommand(context: CliContext, commandName: string, moduleName: string) {
    const { pkg } = context;

    const isNotFoundError = (err: Error) => err.message.match(/Cannot find module/);
    try {
        return require(pkg.resolveModule(`${moduleName}/lib/${commandName}/${commandName}`));
    } catch (err) {
        if (isNotFoundError(err)) {
            console.log();
            console.log(`  Command ${chalk.cyan(`malagu ${commandName}`)} requires ${chalk.cyan(`${moduleName}`)} to be installed.`);
            console.log();
            process.exit(-1);
        } else {
            throw err;
        }
    }
}

export function loadContext(program: CommanderStatic, spinner: ora.Ora) {
    const options = minimist(process.argv.slice(2));
    const mode = getMode(options);
    const targets = getTargets(options);
    const prod = options.p || options.prod;
    return CliContext.create(program, { targets, mode, prod, dev: isDev(options), spinner });
}

function getArrayOptions(options: any, prop: string, shortProp: string) {
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

