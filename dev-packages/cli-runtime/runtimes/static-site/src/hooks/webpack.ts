import { ConfigurationContext, FRONTEND_TARGET, WebpackContext, getProjectHomePath } from '@malagu/cli-service';
import { join } from 'path';
const rimraf = require('rimraf');

export default async (context: WebpackContext) => {
    const { configurations } = context;
    const config = ConfigurationContext.getBackendConfiguration(
        configurations
    );
    const projectHomePath = getProjectHomePath();
    if (config && !projectHomePath.startsWith(process.cwd())) {
        const CopyPlugin = require('copy-webpack-plugin');
        const to = join(config.output.get('path'), '..', '..', FRONTEND_TARGET, 'dist');
        rimraf.sync(to);
        config
            .plugin('copyFrontend')
                .use(CopyPlugin, [{
                    patterns: [{
                        from: process.cwd(),
                        to
                    }]
                }]);
    }
};
