import { DeployContext, getHomePath } from '@malagu/cli';
import { join } from 'path';
const chalk = require('chalk');
import { spawnSync } from 'child_process';

export default (context: DeployContext) => {
    const { pkg, prod } = context;
    const cwd = getHomePath(pkg);
    console.log(`Deploying ${chalk.bold.yellow(pkg.pkg.name)} to Zeit...`);
    spawnSync('now', prod ? ['--prod', '--local-config', join(cwd, 'now.json')] : ['--local-config', join(cwd, 'now.json')], { cwd, stdio: 'inherit' });
};
