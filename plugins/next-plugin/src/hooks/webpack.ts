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
        let nextConfigPath = join(process.cwd(), 'next.config.js');
        let nextConfig: { distDir?: string } = {};
        if (existsSync(nextConfigPath)) {
            nextConfig = require(nextConfigPath);
        } else {
            nextConfigPath = join(process.cwd(), 'next.config.mjs');
            if (existsSync(nextConfigPath)) {
                nextConfig = await eval(`import('${nextConfigPath}')`);
            }
        }

        distDir = nextConfig.distDir ?? distDir;

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
                        to: resolve(backendProjectDistPath, nextConfigPath.split('/').pop()!)
                    }
                ]
            }]);
    }
};
