
import { CliContext } from '../../context';
import { BACKEND_TARGET } from '../../constants';
import { getPort } from '../utils';

export class DevServerConfigFactory {

    create(config: any, context: CliContext, target: string) {
        const { cfg, port, open } = context;
        const realPort = getPort(cfg, target, port);
        const baseDevServerConfig = {
            port: realPort,
            open,
            contentBase: false
        };

        if (BACKEND_TARGET === target) {
            return {
                devServer: {
                    ...baseDevServerConfig,
                    writeToDisk: true,
                }
            };
        } else {
            return {
                devServer: {
                    ...baseDevServerConfig
                }
            };
        }
    }

    support(context: CliContext, target: string): boolean {
        return context.dev;
    }
}

