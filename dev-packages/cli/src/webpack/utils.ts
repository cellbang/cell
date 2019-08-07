const url = require('url');
const ip = require('internal-ip');
const chalk = require('chalk');
const open = require('open');
const isAbsoluteUrl = require('is-absolute-url');

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

export function getDevSuccessInfo(options: any): string[] {
    const uri = getUri(options);
    const infos = [];

    if (options.socket) {
        infos.push(`Listening to socket at ${chalk.green(options.socket)}`);
    } else {
        infos.push(`Project is running at ${chalk.green(uri)}`);
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

    if (options.open) {
        runOpen(uri, options, infos);
    }
    return infos;
}

export function runOpen(uri: any, options: any, infos: string[]) {
    let openOptions = { wait: false };
    let openMessage = 'Unable to open browser';

    if (typeof options.open === 'string') {
        openOptions = Object.assign({}, openOptions, { app: options.open });
        openMessage += `: ${options.open}`;
    }

    const pageUrl =
        options.openPage && isAbsoluteUrl(options.openPage)
            ? options.openPage
            : `${uri}${options.openPage || ''}`;

    return open(pageUrl, openOptions).catch(() => {
        infos.push(
            `${openMessage}. If you are running in a headless environment, please do not use the --open flag`
        );
    });
}
