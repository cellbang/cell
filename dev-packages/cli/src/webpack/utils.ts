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
        infos.push(`The ${chalk.yellow.bold(name)} is running at ${chalk.green(uri)}`);
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
