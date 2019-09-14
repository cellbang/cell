import { Context as BuildContext } from '../webpack/config/context';
import { ConfigFactory } from '../webpack/config/config-factory';
import { Context, ServeContext } from './context';
const chalk = require('chalk');

export class HookExecutor {

    protected async buildContext(projectPath: string = process.cwd()): Promise<Context> {
        const context = await BuildContext.create(projectPath);
        context.dev = false;
        const configFactory = new ConfigFactory();
        const configurations = await configFactory.create(context);
        return {
            pkg: context.pkg,
            buildContext: context,
            configurations: configurations
        };
    }

    async executeInitHooks(projectPath?: string) {
        const context = await this.buildContext(projectPath);
        const modules = context.pkg.initHookModules;
        await this.doExecuteHooks(modules, context, 'initHooks');
    }

    async executeDeployHooks(projectPath?: string) {
        const context = await this.buildContext(projectPath);
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

    protected async doExecuteHooks(modules: Map<string, string>, context: Context, hookName: string): Promise<void> {

        for (const m of modules.entries()) {
            const [moduleName, modulePath] = m;
            const name = moduleName.split('/').pop();
            if (name) {
                const config = context.pkg.backendConfig[name];
                if (!config || config[hookName] !== false) {
                    await require(modulePath).default(context);
                }
            }
        }
    }
}
