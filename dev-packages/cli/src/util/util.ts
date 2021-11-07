import { CliContext } from '@malagu/cli-common';
const minimist = require('minimist');
import * as ora from 'ora';
import { Command } from 'commander';

export function loadContext(program: Command, spinner: ora.Ora) {
    const options = minimist(process.argv.slice(2));
    const mode = getMode(options);
    const targets = getTargets(options);
    const prod = options.p || options.prod;
    return CliContext.create(program, { args: options._, targets, mode, prod, dev: isDev(options), spinner });
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

