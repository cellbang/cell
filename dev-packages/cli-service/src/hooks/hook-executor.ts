import { ServeContext, WebpackContext } from '../context';
import { HookExecutor as BaseHookExecutor } from '@malagu/cli-common';
const chalk = require('chalk');

export class HookExecutor extends BaseHookExecutor {

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
        return this.doExecuteHooks(modules, context, 'webpackHooks');
    }

}
