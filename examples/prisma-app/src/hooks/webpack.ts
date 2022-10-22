import {
    ConfigurationContext,
    WebpackContext,
} from '@malagu/cli-service/lib/context/context-protocol';
import { PathUtil } from '@malagu/cli-common/lib/utils/path-util';
export default async (context: WebpackContext) => {
    const { configurations } = context;
    const config = ConfigurationContext.getBackendConfiguration(configurations);
    if (config) {
        const CopyPlugin = require('copy-webpack-plugin');
        const to = PathUtil.getProjectHomePath();
        config.plugin('copyPrisma').use(CopyPlugin, [
            {
                patterns: [
                    {
                        from: process.cwd() + '/prisma',
                        to: to + '/dist/prisma',
                    },
                    {
                        from: process.cwd() + '/prisma-client',
                        to: to + '/dist/prisma-client',
                    },
                ],
            },
        ]);
    }
};
