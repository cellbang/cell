import { CliContext } from '../context/context-protocol';
import { Module } from '../package/package-protocol';
import { ConfigUtil } from '../utils/config-util';
const chalk = require('chalk');

export enum HookStage {
    on = 'default',
    before = 'before',
    after = 'after'
}

export class HookExecutor {

    protected print(hookName: string, modules: Module[]) {
        if (modules.length === 0) {
            return;
        }
        console.log(chalk`\nmalagu {yellow.bold hook} - {bold ${hookName}}`);
        for (const module of modules) {
            console.log(chalk`malagu {cyan.bold hook} - ${ module.name }`);
        }
    }

    executeCompileHooks(context: CliContext, stage?: HookStage): Promise<any[]> {
        const modules = context.pkg.compileHookModules;
        return this.doExecuteHooks(modules, context, 'compileHooks', stage);
    }

    executeBuildHooks(context: CliContext, stage?: HookStage): Promise<any[]> {
        const modules = context.pkg.buildHookModules;
        return this.doExecuteHooks(modules, context, 'buildHooks', stage);
    }

    executeServeHooks(context: CliContext, stage?: HookStage): Promise<any[]> {
        const modules = context.pkg.serveHookModules;
        return this.doExecuteHooks(modules, context, 'serveHooks', stage);
    }

    executeDeployHooks(context: CliContext, stage?: HookStage): Promise<any[]> {
        const modules = context.pkg.deployHookModules;
        return this.doExecuteHooks(modules, context, 'deployHooks', stage);
    }

    executeCliHooks(context: CliContext, stage?: HookStage): Promise<any[]> {
        const modules = context.pkg.cliHookModules;
        return this.doExecuteHooks(modules, context, 'cliHooks', stage);
    }

    executeInitHooks(context: CliContext, stage?: HookStage): Promise<any[]> {
        const modules = context.pkg.initHookModules;
        return this.doExecuteHooks(modules, context, 'initHooks', stage);
    }

    executeConfigHooks(context: CliContext, stage?: HookStage): Promise<any[]> {
        const modules = context.pkg.configHookModules;
        return this.doExecuteHooks(modules, context, 'configHooks', stage);
    }

    executeInfoHooks(context: CliContext, stage?: HookStage): Promise<any[]> {
        const modules = context.pkg.infoHookModules;
        return this.doExecuteHooks(modules, context, 'infoHooks', stage);
    }

    async executeHooks(context: CliContext, hookName: string, stage?: HookStage): Promise<any[]> {
        const modules = context.pkg.computeModules(hookName);
        return this.doExecuteHooks(modules, context, hookName, stage);
    }

    protected checkHooks(context: CliContext, properties: string[]): boolean {
        const config = ConfigUtil.getBackendConfig(context.cfg);
        let current: any = config;
        for (const p of properties) {
            current = current[p];
            if (!current) {
                break;
            }
        }

        return current === false ? false : true;
    }

    protected async doRequire(context: CliContext, path: string, stage: HookStage = HookStage.on) {
        const obj = require(path);
        if (stage in obj) {
            return obj[stage](context);
        }
    }

    protected async doExecuteHooks(modules: Module[], context: CliContext, hookName: string, stage?: HookStage): Promise<any[]> {
        const { REGISTER_INSTANCE, register } = require('ts-node');
        // Avoid duplicate registrations
        if (!(process as any)[REGISTER_INSTANCE]) {
            register({ transpileOnly: true });
        }

        const result: any = [];

        for (const m of modules) {
            const properties: string[] = [];
            const { componentName } = m;
            if (componentName.startsWith('@')) {
                const [p1, p2] = componentName.split('/');
                properties.push(p1.substring(1));
                if (p2) {
                    properties.push(p2);
                }
            } else {
                properties.push(componentName);
            }
            if (properties.length > 0) {
                properties.push(hookName);
                if (this.checkHooks(context, properties)) {
                    result.push(await this.doRequire(
                        context,
                        m.path,
                        stage
                    ));
                }
            }
        }
        return result;
    }

}
