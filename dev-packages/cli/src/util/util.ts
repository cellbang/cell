import { ContextUtils } from '@malagu/cli-common';

const chalk = require('chalk');

export function loadCommand(commandName: string, moduleName: string) {
    const { pkg } = ContextUtils.getCurrent();

    const isNotFoundError = (err: Error) => err.message.match(/Cannot find module/);
    try {
        return require(pkg.resolveModule(`${moduleName}/lib/${commandName}/${commandName}`));
    } catch (err) {
        if (isNotFoundError(err)) {
            console.log();
            console.log(`  Command ${chalk.cyan(`malagu ${commandName}`)} requires ${chalk.cyan(`${moduleName}`)} to be installed.`);
            console.log();
            process.exit(-1);
        } else {
            throw err;
        }
    }
}
