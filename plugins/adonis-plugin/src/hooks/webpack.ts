import { ConfigurationContext, WebpackContext } from '@malagu/cli-service/lib/context/context-protocol';
import { PathUtil } from '@malagu/cli-common/lib/utils/path-util';
import { resolve } from 'path';

export default async (context: WebpackContext) => {
    const { configurations } = context;

    const config = ConfigurationContext.getBackendConfiguration(
        configurations
    );

    if (config) {
        const patterns = [];
        let distDir = 'build';
        const backendProjectDistPath = PathUtil.getBackendProjectDistPath();
        
        patterns.push({
            from: resolve(process.cwd(), distDir),
            to: resolve(backendProjectDistPath, distDir)
        });

        const CopyPlugin = require('copy-webpack-plugin');
        config
            .plugin('copyAdonis')
            .use(CopyPlugin, [{ patterns }]);
    }
};
