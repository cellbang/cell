
import { BACKEND_TARGET, CliContext, getPort } from '@malagu/cli-common';
import * as WebpackChian from 'webpack-chain';

export class DevServerConfigFactory {

    create(config: WebpackChian, context: CliContext, target: string) {
        const { cfg, port, open } = context;
        const realPort = getPort(cfg, target, port);
        config
            .devServer
                .port(realPort)
                .open(open)
                .contentBase(false)

        if (BACKEND_TARGET === target) {
            config
                .devServer
                    .writeToDisk(true);
        }
    }

    support(context: CliContext, target: string): boolean {
        return context.dev;
    }
}

