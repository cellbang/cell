
import { BACKEND_TARGET, CliContext, getPort } from '@malagu/cli-common';
import * as WebpackChain from 'webpack-chain';

export class DevServerConfigFactory {

    create(config: WebpackChain, context: CliContext, target: string) {
        const { cfg, port, open } = context;
        const realPort = getPort(cfg, target, port);
        config
            .devServer
                .port(realPort)
                .open(open)
                .merge({
                    static: false
                });

        if (BACKEND_TARGET === target) {
            config
                .devServer
                    .merge({
                        devMiddleware: {
                            writeToDisk: true
                        }
                    });
        }
    }

    support(context: CliContext, target: string): boolean {
        return context.dev;
    }
}

