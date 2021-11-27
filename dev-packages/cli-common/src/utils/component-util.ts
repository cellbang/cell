import { readFileSync, existsSync } from 'fs-extra';
import * as lockfile from '@yarnpkg/lockfile';
import * as path from 'path';
const chalk = require('chalk');

export namespace ComponentUtil {
    export function checkPkgVersionConsistency(pkgName: string | RegExp, projectPath: string) {
        const yarnLockFile = path.resolve(projectPath, 'yarn.lock');
        const npmLockFile = path.resolve(projectPath, 'package-lock.json');

        if (existsSync(yarnLockFile)) {
            const file = readFileSync(yarnLockFile, 'utf8');
            const json = lockfile.parse(file);
            if (json.type !== 'success') {
                console.log(chalk`malagu {red.bold error} - yarn.lock file is in conflict status, pls solve the conflict then run the command again`);
                process.exit(-1);
            }
            if (json.object) {
                let pkgVersion = '';
                let newPkgVersion = '';
                Object.keys(json.object).forEach(pkg => {

                    if (pkg.match(pkgName)) {
                        newPkgVersion = json.object[pkg].version;
                        if (!pkgVersion) {
                            pkgVersion = newPkgVersion;
                        }
                        if (pkgVersion !== newPkgVersion) {
                            // eslint-disable-next-line max-len
                            console.log(chalk`\nmalagu {red.bold error} - malagu component has existed two different versions[${chalk.yellow(pkgVersion)} vs ${chalk.yellow(newPkgVersion)}], thus will cause some unexpected problem, so pls check`);
                            process.exit(-1);
                        }
                    }
                });
            }
        } else if (existsSync(npmLockFile)) {
            const json: { dependencies: { [key: string]: any } } = require(npmLockFile);
            let pkgVersion = '';
            let newPkgVersion = '';
            Object.keys(json.dependencies).forEach((dep: string) => {
                if (dep.match(pkgName)) {
                    newPkgVersion = json.dependencies[dep].version;
                    if (!pkgVersion) {
                        pkgVersion = newPkgVersion;
                    }
                    if (pkgVersion !== newPkgVersion) {
                        // eslint-disable-next-line max-len
                        console.log(chalk`\nmalagu {red.bold error} - malagu component has existed two different versions[${chalk.yellow(pkgVersion)} vs ${chalk.yellow(newPkgVersion)}], thus will cause some unexpected problem, so pls check`);
                        process.exit(-1);
                    }
                }
            });
        }
    }
}

