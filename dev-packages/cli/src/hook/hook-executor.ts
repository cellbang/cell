import { ApplicationPackage } from '../package/application-package';
const chalk = require('chalk');

export class HookExecutor {

    pkg: ApplicationPackage;

    constructor() {
        this.pkg = new ApplicationPackage({ projectPath: process.cwd() });
    }

    async executeInitHooks() {
        const modules = this.pkg.initHookModules;
        for (const modulePath of modules.values()) {
            await require(modulePath).default({ pkg: this.pkg });
        }
    }

    async executeDeployHooks() {
        const modules = this.pkg.deployHookModules;
        if (modules.size === 0) {
            console.log(chalk.yellow('Please install the deploy hook first.'));
            return;
        }
        for (const modulePath of modules.values()) {
            await require(modulePath).default({ pkg: this.pkg });
        }
    }
}
