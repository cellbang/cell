import * as fs from 'fs';
import * as lockfile from '@yarnpkg/lockfile';
import { ApplicationPackage, ApplicationConfig } from '../package';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import { Module } from '../package';
import * as path from 'path';
import { CliContext } from '../context';
const chalk = require('chalk');

export function checkPkgVersionConsistency(pkgName: string | RegExp, projectPath: string) {
    const yarnLockFile = path.resolve(projectPath, 'yarn.lock');
    const npmLockFile = path.resolve(projectPath, 'package-lock.json');

    if (fs.existsSync(yarnLockFile)) {
        const file = fs.readFileSync(yarnLockFile, 'utf8');
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
    } else if (fs.existsSync(npmLockFile)) {
        const json: { dependencies: { [key: string]: any}} = require(npmLockFile);
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

export function getWebpackConfig(cfg: ApplicationConfig, target: string) {
    return getMalaguConfig(cfg, target).webpack || {};

}

export function getFrontendWebpackConfig(cfg: ApplicationConfig) {
    return getWebpackConfig(cfg, FRONTEND_TARGET);
}

export function getBackendWebpackConfig(cfg: ApplicationConfig) {
    return getWebpackConfig(cfg, BACKEND_TARGET);
}

export function getMalaguConfig(cfg: ApplicationConfig, target: string) {
    return getConfig(cfg, target).malagu || {};
}

export function getFrontendMalaguConfig(cfg: ApplicationConfig) {
    return getMalaguConfig(cfg, FRONTEND_TARGET);
}

export function getBackendMalaguConfig(cfg: ApplicationConfig) {
    return getMalaguConfig(cfg, BACKEND_TARGET);
}

export function getConfig(cfg: ApplicationConfig, target: string) {
    return cfg.getConfig(target) || {};
}

export function getFrontendConfig(cfg: ApplicationConfig) {
    return cfg.getConfig(FRONTEND_TARGET);
}

export function getBackendConfig(cfg: ApplicationConfig) {
    return cfg.getConfig(BACKEND_TARGET);
}

export function getAssets(pkg: ApplicationPackage, target: string): Module[] {
    return (pkg as any)[`${target}Assets`];
}

export function getFrontendAssets(pkg: ApplicationPackage): Module[] {
    return getAssets(pkg, FRONTEND_TARGET);
}

export function getBackendAssets(pkg: ApplicationPackage): Module[] {
    return getAssets(pkg, BACKEND_TARGET);
}

export function getModules(pkg: ApplicationPackage, target: string): Module[] {
    return (pkg as any)[`${target}Modules`];
}

export function getFrontendModules(pkg: ApplicationPackage): Module[] {
    return getModules(pkg, FRONTEND_TARGET);
}

export function getBackendModules(pkg: ApplicationPackage): Module[] {
    return getModules(pkg, BACKEND_TARGET);
}

export function support(cfg: ApplicationConfig, target: string) {
    const targets = cfg.getConfig(target).targets || [FRONTEND_TARGET, BACKEND_TARGET];
    return (cfg.pkg as any)[`${target}Modules`].length > 0 && targets.includes(target);
}

export function supportBackend(cfg: ApplicationConfig) {
    return support(cfg, BACKEND_TARGET);
}

export function supportFrontend(cfg: ApplicationConfig) {
    return support(cfg, FRONTEND_TARGET);
}

export function getPort(cfg: ApplicationConfig, target: string, port?: number) {
    if (port !== undefined) {
        return port;
    }
    const server = getMalaguConfig(cfg, target).server || { port: 3000 };
    return server.port;
}

export function getHomePath(pkg: ApplicationPackage, target: string = '') {
    return path.resolve(pkg.projectPath, '.malagu', target);
}

export function getBackendHomePath(pkg: ApplicationPackage) {
    return getHomePath(pkg, BACKEND_TARGET);
}

export function getFrontendHomePath(pkg: ApplicationPackage) {
    return getHomePath(pkg, FRONTEND_TARGET);
}

export function executeHook(context: CliContext, hook: string) {
    const { pkg } = context;
    try {
        const { HookExecutor } = require(pkg.resolveModule('@malagu/cli-service/lib/hook'));
        return new HookExecutor()[`execute${hook}Hooks`](context);
    } catch (err) {
        // noop
    }
}
