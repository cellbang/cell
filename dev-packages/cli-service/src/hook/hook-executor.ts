import { ServeContext, BuildContext, DeployContext, WebpackContext } from '../context';
import { CliContext, ConfigContext, getBackendConfig, InitContext } from '@malagu/cli-common';
import { resolve } from 'path';
const chalk = require('chalk');

export class HookExecutor {

    executeBuildHooks(context: BuildContext): Promise<any[]> {
        const modules = context.pkg.buildHookModules;
        return this.doExecuteHooks(modules, context, 'buildHooks');
    }

    executeDeployHooks(context: DeployContext): Promise<any[]> {
        const modules = context.pkg.deployHookModules;
        return this.doExecuteHooks(modules, context, 'deployHooks');
    }

    async executeServeHooks(context: ServeContext): Promise<any[]> {
        const modules = context.pkg.serveHookModules;
        if (modules.size === 0) {
            console.log(chalk.yellow('Please provide the serve hook first.'));
            return [];
        }
        return this.doExecuteHooks(modules, context, 'serveHooks');
    }

    executeWebpackHooks(context: WebpackContext): Promise<any[]> {
        const modules = context.pkg.webpackHookModules;
        return this.doExecuteHooks(modules, context, 'webpackHooks');
    }

    executeCliHooks(context: CliContext): Promise<any[]> {
        const modules = context.pkg.cliHookModules;
        return this.doExecuteHooks(modules, context, 'cliHooks');
    }

    executeInitHooks(context: InitContext): Promise<any[]> {
        const modules = context.pkg.initHookModules;
        return this.doExecuteHooks(modules, context, 'initHooks');
    }

    executeConfigHooks(context: ConfigContext): Promise<any[]> {
        const modules = context.pkg.configHookModules;
        return this.doExecuteHooks(modules, context, 'configHooks');
    }

    async executeHooks(context: CliContext, hookName: string): Promise<any[]> {
        const modules = context.pkg.computeModules(hookName);
        return this.doExecuteHooks(modules, context, hookName);
    }

    protected checkHooks(context: CliContext, properties: string[]): boolean {
        const config = getBackendConfig(context.cfg);
        let current: any = config;
        for (const p of properties) {
            current = current[p];
            if (!current) {
                break;
            }
        }

        return current !== false ? true : false;
    }

    protected async doRequire(context: CliContext, ...paths: string[]) {
        let lastError: Error | undefined;
        for (const path of paths) {
            try {
                return await require(path).default(context);
            } catch (error) {
                lastError = error;
                if (error && error.code === 'MODULE_NOT_FOUND') {
                    continue;
                } else {
                    throw error;
                }
            }
        }

        if (lastError) {
            throw lastError;
        }

    }

    protected async doExecuteHooks(modules: Map<string, string>, context: CliContext, hookName: string): Promise<any[]> {
        const { REGISTER_INSTANCE, register } = require('ts-node');
        // Avoid duplicate registrations
        if (!(process as any)[REGISTER_INSTANCE]) {
            register();
        }

        const result: any = [];

        for (const m of modules.entries()) {
            const properties: string[] = [];
            const [moduleName, modulePath] = m;
            if (moduleName.startsWith('@')) {
                const [p1, p2] = moduleName.split('/');
                properties.push(p1.substring(1));
                if (p2) {
                    properties.push(p2.substring(0, p2.lastIndexOf('@')));
                }
            } else {
                properties.push(moduleName.substring(0, moduleName.lastIndexOf('@')));
            }
            if (properties.length > 0) {
                properties.push(hookName);
                if (this.checkHooks(context, properties)) {
                    result.push(await this.doRequire(
                        context,
                        resolve(context.pkg.projectPath, 'node_modules', modulePath),
                        resolve(context.pkg.projectPath, '..', 'node_modules', modulePath),
                        resolve(context.pkg.projectPath, '..', '..', 'node_modules', modulePath),
                        modulePath
                    ));
                }
            }
        }
        return result;
    }

}
