// @ts-check

const path = require('path');
const chalk = require('chalk');
const cp = require('child_process');

let code = 0;
const workspaces = JSON.parse(cp.execSync('yarn --silent workspaces info').toString());
for (const name in workspaces) {
    const workspace = workspaces[name];
    const location = path.resolve(process.cwd(), workspace.location);
    const packagePath = path.resolve(location, 'package.json');
    const pck = require(packagePath);
    if (!pck.private) {
        const pckName = `${pck.name}@${pck.version}`;
        if (cp.execSync(`npm view ${pckName} version --json`).toString().trim()) {
            console.info(`${pckName}: published`);
        } else {
            console.error(`(${chalk.red('ERR')}) ${pckName}: ${chalk.red('NOT')} published`);
            code = 1;
        }
    }
}
process.exit(code);
