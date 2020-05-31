import { ServeContext, InitContext, BuildContext, DeployContext, WebpackContext, HookContext, ConfigContext } from '../context';
import { resolve } from 'path';
import { REGISTER_INSTANCE, register } from 'ts-node';
import { getConfig } from '../webpack/utils';
import { BACKEND_TARGET } from '../constants';
const chalk = require('chalk');

// Avoid duplicate registrations
if (!process[REGISTER_INSTANCE]) {
    register();
}

export class HookExecutor {

    async executeInitHooks(context: InitContext): Promise<void> {
        const modules = context.pkg.initHookModules;
        await this.doExecuteHooks(modules, context, 'initHooks');
    }

    async executeConfigHooks(context: ConfigContext): Promise<void> {
        const modules = context.pkg.configHookModules;
        await this.doExecuteHooks(modules, context, 'configHooks');
    }

    async executeBuildHooks(context: BuildContext): Promise<void> {
        const modules = context.pkg.buildHookModules;
        await this.doExecuteHooks(modules, context, 'buildHooks');
    }

    async executeDeployHooks(context: DeployContext): Promise<void> {
        const modules = context.pkg.deployHookModules;
        await this.doExecuteHooks(modules, context, 'deployHooks');
    }

    async executeServeHooks(context: ServeContext): Promise<void> {
        const modules = context.pkg.serveHookModules;
        if (modules.size === 0) {
            console.log(chalk.yellow('Please provide the serve hook first.'));
            return;
        }
        await this.doExecuteHooks(modules, context, 'serveHooks');
    }

    async executeWebpackHooks(context: WebpackContext): Promise<void> {
        const modules = context.pkg.webpackHookModules;
        await this.doExecuteHooks(modules, context, 'webpackHooks');
    }

    async executeHooks(context: HookContext, hookName: string): Promise<void> {
        const modules = context.pkg.computeModules(hookName);
        await this.doExecuteHooks(modules, context, hookName);
    }

    protected checkHooks(context: HookContext, properties: string[]): boolean {
        const config = getConfig(context.pkg, BACKEND_TARGET);
        let current: any = config;
        for (const p of properties) {
            current = current[p];
            if (current === undefined) {
                break;
            }
        }

        return current !== false ? true : false;
    }

    protected async doExecuteHooks(modules: Map<string, string>, context: HookContext, hookName: string): Promise<void> {

        for (const m of modules.entries()) {
            const properties: string[] = [];
            const [moduleName, modulePath] = m;
            if (moduleName.startsWith('@')) {
                const [p1, p2] = moduleName.split('/');
                properties.push(p1.substring(1));
                if (p2) {
                    properties.push(p2);
                }
            } else {
                properties.push(moduleName);
            }
            if (properties.length > 0) {
                properties.push(hookName);
                if (this.checkHooks(context, properties)) {
                    try {
                        await require(resolve(context.pkg.projectPath, 'node_modules', modulePath)).default(context);
                    } catch (error) {
                        if (error && error.code === 'MODULE_NOT_FOUND') {
                            await require(modulePath).default(context);
                        } else {
                            throw error;
                        }
                    }
                }
            }
        }
    }
}
