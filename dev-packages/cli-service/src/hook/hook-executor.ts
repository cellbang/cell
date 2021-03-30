import { ServeContext, BuildContext, DeployContext, WebpackContext } from '../context';
import { HookExecutor } from '@malagu/cli-common';
const chalk = require('chalk');

export class ServiceHookExecutor extends HookExecutor {

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

}
