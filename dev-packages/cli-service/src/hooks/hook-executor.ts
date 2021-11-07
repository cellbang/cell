import { ServeContext, BuildContext, DeployContext, WebpackContext } from '../context';
import { HookExecutor as BaseHookExecutor } from '@malagu/cli-common';
const chalk = require('chalk');

export class HookExecutor extends BaseHookExecutor {

    executeBuildHooks(context: BuildContext): Promise<any[]> {
        const modules = context.pkg.buildHookModules;
        this.print('build', modules);
        return this.doExecuteHooks(modules, context, 'buildHooks');
    }

    executeDeployHooks(context: DeployContext): Promise<any[]> {
        const modules = context.pkg.deployHookModules;
        this.print('deploy', modules);
        return this.doExecuteHooks(modules, context, 'deployHooks');
    }

    async executeServeHooks(context: ServeContext): Promise<any[]> {
        const modules = context.pkg.serveHookModules;
        if (modules.length === 0) {
            console.log(chalk.yellow('Please provide the serve hook first.'));
            return [];
        }
        return this.doExecuteHooks(modules, context, 'serveHooks');
    }

    executeWebpackHooks(context: WebpackContext): Promise<any[]> {
        const modules = context.pkg.webpackHookModules;
        this.print('webpack', modules);
        return this.doExecuteHooks(modules, context, 'webpackHooks');
    }

}
