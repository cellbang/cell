import { DeployContext, PathUtil } from '@malagu/cli-common';
import { join } from 'path';
const chalk = require('chalk');
import { spawnSync } from 'child_process';
const commandExists = require('command-exists');

export default async (context: DeployContext) => {
    const { pkg, prod} = context;
    const cwd = PathUtil.getProjectDistPath();
    console.log(`Deploying ${chalk.bold.yellow(pkg.pkg.name)} to Vercel...`);
    try {
        await commandExists('vercel');
    } catch (err) {
        console.log(chalk`The vercel command does not exist, please install it first: {yellow.bold npm i -g vercel}`);
        process.exit(-1);
    }
    spawnSync('vercel', prod ? ['--prod', '--local-config', join(cwd, 'vercel.json')] : ['--local-config', join(cwd, 'now.json')], { cwd, stdio: 'inherit' });
};
