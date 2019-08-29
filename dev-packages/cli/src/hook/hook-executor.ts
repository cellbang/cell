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
        const context = await this.buildContext(projectPath)
        const modules = context.pkg.initHookModules;
        for (const modulePath of modules.values()) {
            await require(modulePath).default(context);
        }
    }

    async executeDeployHooks(projectPath?: string) {
        const context = await this.buildContext(projectPath)
        const modules = context.pkg.deployHookModules;
        if (modules.size === 0) {
            console.log(chalk.yellow('Please provide the deploy hook first.'));
            return;
        }
        for (const modulePath of modules.values()) {
            await require(modulePath).default(context);
        }
    }

    async executeServeHooks(context: ServeContext) {
        const modules = context.pkg.serveHookModules;
        if (modules.size === 0) {
            console.log(chalk.yellow('Please provide the serve hook first.'));
            return;
        }
        for (const modulePath of modules.values()) {
            await require(modulePath).default(context);
        }
    }
}
