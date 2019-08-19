import { ApplicationPackage } from '../package/application-package';
import { Context as BuildContext } from '../webpack/config/context';
import { ConfigFactory } from '../webpack/config/config-factory';
import { Context } from './context';
const chalk = require('chalk');

export class HookExecutor {

    pkg: ApplicationPackage;

    constructor() {
        this.pkg = new ApplicationPackage({ projectPath: process.cwd() });
    }

    protected async buildContext(): Promise<Context> {
        const context = await BuildContext.create();
        context.dev = true;
        const configFactory = new ConfigFactory();
        const configurations = await configFactory.create(context);
        return {
            pkg: this.pkg,
            buildContext: context,
            configurations: configurations
        };
    }

    async executeInitHooks() {
        const modules = this.pkg.initHookModules;
        for (const modulePath of modules.values()) {
            await require(modulePath).default(await this.buildContext());
        }
    }

    async executeDeployHooks() {
        const modules = this.pkg.deployHookModules;
        if (modules.size === 0) {
            console.log(chalk.yellow('Please install the deploy hook first.'));
            return;
        }
        for (const modulePath of modules.values()) {
            await require(modulePath).default(await this.buildContext());
        }
    }
}
