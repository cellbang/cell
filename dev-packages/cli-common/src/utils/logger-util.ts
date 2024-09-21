import { BACKEND_TARGET, FRONTEND_TARGET } from '../constants';
import { CliContext } from '../context/context-protocol';
import { ConfigUtil } from './config-util';
const chalk = require('chalk');

export namespace LoggerUtil {

    export function printTargets(ctx: CliContext) {
        const targets = [ BACKEND_TARGET, FRONTEND_TARGET ];

        for (const target of targets) {
            if (!ConfigUtil.support(ctx.cfg, target)) {
                continue;
            }

            console.log(chalk`🎯  cell {yellow.bold target} - {bold ${target}}`);
        }
    }

    export function printStage(ctx: CliContext) {
        const { stage } = ConfigUtil.getBackendConfig(ctx.cfg);
        if (!stage) {
            return;
        }
        const stageMap = {
            'test': '🏔 ',
            'pre': '⛰ ',
            'prod': '🌋'
        };
        console.log(chalk`${(stageMap as any)[stage] || '🏕 '}  cell {bold.red stage} - {bold ${stage}}`);
    }

    export function printMode(ctx: CliContext) {
        for (const m of ctx.pkg.rootComponentPackage.cellComponent!.mode!) {
            console.log(chalk`🏷   cell {bold.blue mode} - {bold ${m}}`);
        }
    }

    export function printComponents(ctx: CliContext) {
        for (const component of ctx.pkg.componentPackages) {
            console.log(chalk`🧱  cell {green.bold component} - ${ component.name }@${ component.version }`);
        }
    }
}
