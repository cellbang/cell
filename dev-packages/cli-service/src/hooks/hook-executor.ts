import { BeforeServeContext, ServeContext, WebpackContext } from '../context';
import { HookExecutor as BaseHookExecutor, HookStage } from '@malagu/cli-common/lib/hook/hook-executor';
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

    async executeBeforeServeHooks(context: BeforeServeContext): Promise<any[]> {
        const modules = context.pkg.serveHookModules;
        return this.doExecuteHooks(modules, context, 'serveHooks', HookStage.before);
    }

    executeWebpackHooks(context: WebpackContext): Promise<any[]> {
        const modules = context.pkg.webpackHookModules;
        return this.doExecuteHooks(modules, context, 'webpackHooks');
    }

    executeAfterWebpackHooks(context: WebpackContext): Promise<any[]> {
        const modules = context.pkg.webpackHookModules;
        return this.doExecuteHooks(modules, context, 'webpackHooks', HookStage.after);
    }

    executeBeforeWebpackHooks(context: WebpackContext): Promise<any[]> {
        const modules = context.pkg.webpackHookModules;
        return this.doExecuteHooks(modules, context, 'webpackHooks', HookStage.before);
    }

}
