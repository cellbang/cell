import { HookContext, FRONTEND_TARGET, BACKEND_TARGET } from '@malagu/cli';
// import { spawnProcess } from '@malagu/cli/lib/packager/utils';
import { resolve, join } from 'path';
const chalk = require('chalk');
import { spawnSync } from 'child_process';

export default (context: HookContext) => {
    const { pkg, prod, dest, configurations } = context;
    let cwd: string;
    // const command = /^win/.test(process.platform) ? 'now.cmd' : 'now';
    for (const c of configurations) {
        if (c.name === FRONTEND_TARGET) {
            cwd = resolve(pkg.projectPath, dest, FRONTEND_TARGET);
        } else {
            cwd = resolve(pkg.projectPath, dest, BACKEND_TARGET);
        }
        console.log(`Deploying ${chalk.yellow(c.name)} to Zeit...`);
        spawnSync('now', prod ? ['--prod', '--local-config', join(cwd, 'now.json')] : ['--local-config', join(cwd, 'now.json')], { cwd, stdio: 'inherit' });
    }
};
