import { ConfigurationContext, WebpackContext } from '@malagu/cli-service/lib/context/context-protocol';
import { PathUtil } from '@malagu/cli-common/lib/utils/path-util';
import { join, resolve } from 'path';
import { existsSync } from 'fs-extra';

export default async (context: WebpackContext) => {
    const { pkg, configurations } = context;
    const isLambda = pkg.componentPackages.some(c => c.name === '@malagu/lambda-plugin');
    if (isLambda) {
        console.warn('Next.js does not support deployment to AWS Lambda by default.');
    }

    const config = ConfigurationContext.getBackendConfiguration(
        configurations
    );
    if (config) {
        let distDir = '.next';
        const nextConfigPath = join(process.cwd(), 'next.config.js');
        if (existsSync(nextConfigPath)) {
            const nextConfig = require(nextConfigPath);
            distDir = nextConfig.distDir ?? distDir;
        }
        const CopyPlugin = require('copy-webpack-plugin');
        const backendProjectDistPath = PathUtil.getBackendProjectDistPath();
        config
            .plugin('copyNext')
            .use(CopyPlugin, [{
                patterns: [
                    {
                        from: resolve(process.cwd(), distDir),
                        to: resolve(backendProjectDistPath, distDir)
                    },
                    {
                        from: resolve(process.cwd(), 'public'),
                        to: resolve(backendProjectDistPath, 'public')
                    },
                    {
                        from: nextConfigPath,
                        to: resolve(backendProjectDistPath, 'next.config.js')
                    }
                ]
            }]);
    }
};
