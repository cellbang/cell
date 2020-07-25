
import { HookContext } from '../../context';
import { BACKEND_TARGET } from '../../constants';
import { getPort } from '../utils';

export class DevServerConfigFactory {

    create(config: any, context: HookContext, target: string) {
        const { pkg, port, open } = context;
        const realPort = getPort(pkg, target, port);
        const baseDevServerConfig = {
            watchOptions: {
                ignored: /node_modules/
            },
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
                    ...baseDevServerConfig,
                }
            };
        }
    }

    support(context: HookContext, target: string): boolean {
        return context.dev;
    }
}

