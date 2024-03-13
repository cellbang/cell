
import { BACKEND_TARGET } from '@malagu/cli-common/lib/constants';
import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@malagu/cli-common/lib/utils/config-util';
import * as WebpackChain from '@gem-mine/webpack-chain';

export class DevServerConfigFactory {

    create(config: WebpackChain, context: CliContext, target: string) {
        const { cfg, port, open } = context;
        const realPort = ConfigUtil.getPort(cfg, target, port);
        config
            .devServer
                .port(realPort)
                .open(open)
                .merge({
                    static: false,
                    allowedHosts: [ 'all' ]
                });

        if (BACKEND_TARGET === target) {
            config
                .devServer
                    .merge({
                        devMiddleware: {
                            writeToDisk: true
                        },
                        hot: false
                    });
        }
    }

    support(context: CliContext, target: string): boolean {
        return context.dev;
    }
}

