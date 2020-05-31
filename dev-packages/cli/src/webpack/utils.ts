import { ApplicationPackage } from '../package';
import { FRONTEND_TARGET, BACKEND_TARGET } from '../constants';
import * as path from 'path';

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

export function getWebpackConfig(pkg: ApplicationPackage, target: string) {
    return getMalaguConfig(pkg, target).webpack || {};

}

export function getMalaguConfig(pkg: ApplicationPackage, target: string) {
    return getConfig(pkg, target).malagu || {};
}

export function getConfig(pkg: ApplicationPackage, target: string) {
    return pkg.getConfig(target) || {};
}

export function support(pkg: ApplicationPackage, target: string) {
    const targets = pkg.getConfig(target).targets || [FRONTEND_TARGET, BACKEND_TARGET];
    return (pkg as any)[`${target}Modules`].size > 0 && targets.includes(target);

}

export function getPort(pkg: ApplicationPackage, target: string, port?: number) {
    if (port !== undefined) {
        return port;
    }
    const server = getConfig(pkg, target).server || { port: 3000 };
    return server.port;
}

export function getHomePath(pkg: ApplicationPackage, target: string = '') {
    return path.resolve(pkg.projectPath, '.malagu', target);
}
