import { ConfigurationContext, WebpackContext } from '@celljs/cli-service/lib/context/context-protocol';
import { PathUtil } from '@celljs/cli-common/lib/utils/path-util';
import { join, resolve } from 'path';
import { existsSync } from 'fs-extra';

export default async (context: WebpackContext) => {
    const { pkg, configurations } = context;
    const isLambda = pkg.componentPackages.some(c => c.name === '@celljs/lambda-plugin');
    if (isLambda) {
        console.warn('Next.js does not support deployment to AWS Lambda by default.');
    }

    const config = ConfigurationContext.getBackendConfiguration(
        configurations
    );
    if (config) {
        const backendProjectDistPath = PathUtil.getBackendProjectDistPath();
        const publicDir = resolve(process.cwd(), 'public');
        let distDir = '.next';
        let nextConfigPath = join(process.cwd(), 'next.config.js');
        let nextConfig: { distDir?: string } = {};
        const patterns = [];
        if (existsSync(nextConfigPath)) {
            nextConfig = require(nextConfigPath);
        } else {
            nextConfigPath = join(process.cwd(), 'next.config.mjs');
            if (existsSync(nextConfigPath)) {
                /* eslint no-eval: 0 */
                nextConfig = await eval(`import('${nextConfigPath}')`);
            }
        }

        if (existsSync(nextConfigPath)) {
            patterns.push({
                from: nextConfigPath,
                to: resolve(backendProjectDistPath, nextConfigPath.split('/').pop()!)
            });
        }

        if (existsSync(publicDir)) {
            patterns.push({
                from: publicDir,
                to: resolve(backendProjectDistPath, 'public')
            });
        }

        distDir = nextConfig.distDir ?? distDir;
        patterns.push({
            from: resolve(process.cwd(), distDir),
            to: resolve(backendProjectDistPath, distDir)
        });

        const CopyPlugin = require('copy-webpack-plugin');
        config
            .plugin('copyNext')
            .use(CopyPlugin, [{ patterns }]);
    }
};
