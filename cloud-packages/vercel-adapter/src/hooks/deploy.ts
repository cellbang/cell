import { DeployContext, PathUtil } from '@celljs/cli-common';
import { join } from 'path';
const chalk = require('chalk');
import { spawnSync } from 'child_process';
const commandExists = require('command-exists');

export default async (context: DeployContext) => {
    const { pkg, prod} = context;
    console.log(`Deploying ${chalk.bold.yellow(pkg.pkg.name)} to Vercel...`);
    try {
        await commandExists('vercel');
    } catch (err) {
        console.log(chalk`The vercel command does not exist, please install it first: {yellow.bold npm i -g vercel}`);
        process.exit(-1);
    }
    const args = [];
    if (prod) {
        args.push('--prod');
    }
    args.push(...['--local-config', join(PathUtil.getProjectHomePath(), 'vercel.json')]);
    spawnSync('vercel', { cwd: PathUtil.getProjectHomePath(), stdio: 'inherit', shell: true });
};
