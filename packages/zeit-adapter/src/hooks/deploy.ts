import { HookContext, getHomePath } from '@malagu/cli';
import { join } from 'path';
const chalk = require('chalk');
import { spawnSync } from 'child_process';

export default (context: HookContext) => {
    const { pkg, prod, configurations } = context;
    for (const c of configurations) {
        const cwd = getHomePath(pkg, c.name!);
        console.log(`Deploying ${chalk.yellow(c.name)} to Zeit...`);
        spawnSync('now', prod ? ['--prod', '--local-config', join(cwd, 'now.json')] : ['--local-config', join(cwd, 'now.json')], { cwd, stdio: 'inherit' });
    }
};
