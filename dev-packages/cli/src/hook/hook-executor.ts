import { HookContext, ServeContext } from '../context';
import { resolve } from 'path';
require('ts-node').register();
const chalk = require('chalk');

export class HookExecutor {

    async executeInitHooks(context: HookContext) {
        const modules = context.pkg.initHookModules;
        await this.doExecuteHooks(modules, context, 'initHooks');
    }

    async executeDeployHooks(context: HookContext) {
        const modules = context.pkg.deployHookModules;
        if (modules.size === 0) {
            console.log(chalk.yellow('Please provide the deploy hook first.'));
            return;
        }
        await this.doExecuteHooks(modules, context, 'deployHooks');
    }

    async executeServeHooks(context: ServeContext) {
        const modules = context.pkg.serveHookModules;
        if (modules.size === 0) {
            console.log(chalk.yellow('Please provide the serve hook first.'));
            return;
        }
        await this.doExecuteHooks(modules, context, 'serveHooks');
    }

    async executeWebpackHooks(context: HookContext) {
        const modules = context.pkg.webpackHookModules;
        await this.doExecuteHooks(modules, context, 'webpackHooks');
    }

    async executeHooks(context: HookContext, hookName: string): Promise<void> {
        const modules = context.pkg.computeModules(hookName);
        await this.doExecuteHooks(modules, context, hookName);
    }

    protected async doExecuteHooks(modules: Map<string, string>, context: HookContext, hookName: string): Promise<void> {

        for (const m of modules.entries()) {
            const [moduleName, modulePath] = m;
            const name = moduleName.split('/').pop();
            if (name) {
                const malagu = context.pkg.backendConfig['malagu'];
                const config = malagu[name];
                if (!config || config[hookName] !== false) {
                    await require(resolve(context.pkg.projectPath, 'node_modules', modulePath)).default(context);
                }
            }
        }
    }
}
