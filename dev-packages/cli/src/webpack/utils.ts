import { ApplicationPackage } from '../package';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import * as path from 'path';
import { ApplicationConfig } from '../package/application-config';

const url = require('url');
const ip = require('internal-ip');
const chalk = require('chalk');

export function getUri(options: any) {
    const protocol = options.https ? 'https' : 'http';
    const hostname = options.useLocalIp
        ? ip.v4.sync() || 'localhost'
        : options.host || 'localhost';

    const port = options.socket ? 0 : options.port;
    if (options.public) {
        return /^[a-zA-Z]+:\/\//.test(options.public)
            ? `${options.public}`
            : `${protocol}://${options.public}`;
    }
    return url.format({
        protocol,
        hostname,
        port
    });
}

export function getDevSuccessInfo(options: any, name: string): string[] {
    const uri = getUri(options);
    const infos = [];

    if (options.socket) {
        infos.push(`Listening to socket at ${chalk.green(options.socket)}`);
    } else {
        infos.push(`The ${chalk.yellow.bold(name)} is running at ${chalk.bold.green(uri)}`);
    }

    if (options.historyApiFallback) {
        infos.push(
            `404s will fallback to ${chalk.green(
                options.historyApiFallback.index || '/index.html'
            )}`
        );
    }

    if (options.bonjour) {
        chalk.green(
            'Broadcasting "http" with subtype of "webpack" via ZeroConf DNS (Bonjour)'
        );
    }
    return infos;
}

export function getWebpackConfig(cfg: ApplicationConfig, target: string) {
    return getMalaguConfig(cfg, target).webpack || {};

}

export function getMalaguConfig(cfg: ApplicationConfig, target: string) {
    return getConfig(cfg, target).malagu || {};
}

export function getConfig(cfg: ApplicationConfig, target: string) {
    return cfg.getConfig(target) || {};
}

export function getModules(pkg: ApplicationPackage, target: string): Map<string, string> {
    return (pkg as any)[`${target}Modules`];
}

export function support(cfg: ApplicationConfig, target: string) {
    const targets = cfg.getConfig(target).targets || [FRONTEND_TARGET, BACKEND_TARGET];
    return (cfg.pkg as any)[`${target}Modules`].size > 0 && targets.includes(target);

}

export function getPort(cfg: ApplicationConfig, target: string, port?: number) {
    if (port !== undefined) {
        return port;
    }
    const server = getConfig(cfg, target).server || { port: 3000 };
    return server.port;
}

export function getHomePath(pkg: ApplicationPackage, target: string = '') {
    return path.resolve(pkg.projectPath, '.malagu', target);
}
