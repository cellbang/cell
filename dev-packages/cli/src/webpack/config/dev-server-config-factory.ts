
import { HookContext } from '../../context';
import { BACKEND_TARGET } from '../../constants';
import { getPort, getMalaguConfig } from '../utils';

export class DevServerConfigFactory {

    create(config: any, context: HookContext, target: string) {
        const { pkg, port, open } = context;
        const realPort = getPort(pkg, target, port);
        const baseDevServerConfig = {
            stats: 'errors-only',
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
            const server = getMalaguConfig(pkg, target).server || {};
            if (server.endpoint) {
                server.endpoint = server.endpoint.replace('{port}', realPort);
            }
            return {
                devServer: {
                    ...baseDevServerConfig,
                }
            };
        }
    }

    support(context: HookContext, target: string): boolean {
        return true;
    }
}

