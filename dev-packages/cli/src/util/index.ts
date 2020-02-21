import * as paths from 'path';
import * as fs from 'fs';
import * as lockfile from '@yarnpkg/lockfile';
const chalk = require('chalk');

export function checkPkgVersionConsistency (pkgName: string, projectPath: string) {
    const yarnLockFile = paths.resolve(projectPath, 'yarn.lock');
    const npmLockFile = paths.resolve(projectPath, 'package-lock.json');

    if (fs.existsSync(yarnLockFile)) {
        const file = fs.readFileSync(yarnLockFile, 'utf8');
        const json = lockfile.parse(file);
        if (json.type !== 'success') {
            console.log(chalk`malagu {red.bold error} - yarn.lock file is in conflict status, pls solve the conflict then run the command again`);
            process.exit(-1);
        }
        if (json.object) {
            let pkgVersion = '';
            Object.keys(json.object).forEach(pkg => {
                if (pkg.match(pkgName)) {
                    if (!pkgVersion) {
                        pkgVersion = json.object[pkg].version;
                    } else {
                        // eslint-disable-next-line max-len
                        console.log(chalk`malagu {red.bold error} - ${pkgName} package has existed two different versions[${chalk.yellow(pkgVersion)} vs ${chalk.yellow(json.object[pkg].version)}], thus will cause some unexpected problem, so pls check`);
                        process.exit(-1);
                    }
                }
            });
        }
    } else if (fs.existsSync(npmLockFile)) {
        const json: { dependencies: { [key: string]: any}} = require(npmLockFile);

        Object.keys(json.dependencies).forEach((dep: string) => {
            if (json.dependencies[dep].dependencies && json.dependencies[dep].dependencies[pkgName]) {
                // eslint-disable-next-line max-len
                console.log(chalk`malagu {red.bold error} - ${pkgName} package has existed two different versions[${chalk.yellow(dep)} has version ${chalk.yellow(json.dependencies[dep].dependencies[pkgName].version)} of ${pkgName}], thus will cause some unexpected problem, so pls check`);
                process.exit(-1);
            }
        });
    } else {
        // consider the monorepo project case
        // console.log(chalk`malagu {red.bold error} - Pls generate lock file by Yarn or Npm firstly`);
        // process.exit(1);
    }
}
