const url = require('url');
const ip = require('internal-ip');
const chalk = require('chalk');
import * as WebpackChain from 'webpack-chain';

export function getUri(options: WebpackChain.DevServer) {
    const protocol = options.get('https') ? 'https' : 'http';
    const hostname = options.get('useLocalIp')
        ? ip.v4.sync() || 'localhost'
        : options.get('host') || 'localhost';

    const port = options.get('socket') ? 0 : options.get('port');
    if (options.get('public')) {
        return /^[a-zA-Z]+:\/\//.test(options.get('public'))
            ? `${options.get('public')}`
            : `${protocol}://${options.get('public')}`;
    }
    return url.format({
        protocol,
        hostname,
        port
    });
}

export function getDevSuccessInfo(options: WebpackChain.DevServer, name: string): string[] {
    const uri = getUri(options);
    const infos = [];

    if (options.has('socket')) {
        infos.push(`Listening to socket at ${chalk.green(options.get('socket'))}`);
    } else {
        infos.push(`The ${chalk.yellow.bold(name)} is running at ${chalk.bold.green(uri)} 🎉`);
    }

    if (options.has('historyApiFallback')) {
        infos.push(
            `404s will fallback to ${chalk.green(
                options.get('historyApiFallback').index || '/index.html'
            )}`
        );
    }

    if (options.get('bonjour')) {
        chalk.green(
            'Broadcasting "http" with subtype of "webpack" via ZeroConf DNS (Bonjour)'
        );
    }
    return infos;
}
