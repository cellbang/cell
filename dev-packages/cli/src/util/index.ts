import * as paths from 'path';
import * as fs from 'fs';
import * as lockfile from '@yarnpkg/lockfile';
const chalk = require('chalk');

export function malaguCorePkgVersionConsistency (projectPath: string) {
  const yarnLockFile = paths.resolve(projectPath, 'yarn.lock');
  const npmLockFile = paths.resolve(projectPath, 'package-lock.json');

  if (fs.existsSync(yarnLockFile)) {
    const file = fs.readFileSync(yarnLockFile, 'utf8');
    const json = lockfile.parse(file);
    if (json.type !== 'success') {
      throw new Error(chalk.red`yarn.lock file is in conflict status, pls solve the conflict then run the command again`);
    }
    if (json.object) {
      let malaguCoreVer = '';
      Object.keys(json.object).forEach(pkgName => {
        if (pkgName.match(/@malagu\/core/)) {
          if (!malaguCoreVer) {
            malaguCoreVer = json.object[pkgName].version;
          } else {
            throw new Error(chalk.red(`@malagu/core package has existed two different versions[${chalk.yellow(malaguCoreVer)} vs ${chalk.yellow(json.object[pkgName].version)}], thus will cause some unexpected problem, so pls check`));
          }
        }
      });
    }
  } else if (fs.existsSync(npmLockFile)) {
    const json: { dependencies: { [key: string]: any}} = require(npmLockFile);

    Object.keys(json.dependencies).forEach((dep: string) => {
      if (json.dependencies[dep].dependencies && json.dependencies[dep].dependencies['@malagu/core']) {
        throw new Error(chalk.red(`@malagu/core package has existed two different versions[${chalk.yellow(dep)} has version ${chalk.yellow(json.dependencies[dep].dependencies['@malagu/core'].version)} of @malagu/core], thus will cause some unexpected problem, so pls check`));
      }
    });
  } else {
    throw new Error(chalk.red`Pls generate lock file by Yarn or Npm firstly`);
  }
}
