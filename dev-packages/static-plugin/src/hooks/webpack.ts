import { ConfigurationContext, FRONTEND_TARGET, WebpackContext, getProjectHomePath } from '@malagu/cli-service';
import { join } from 'path';
const rimraf = require('rimraf');

export default async (context: WebpackContext) => {
    const { configurations, framework, runtime } = context;
    const config = ConfigurationContext.getBackendConfiguration(
        configurations
    );
    const projectHomePath = getProjectHomePath(runtime);
    if (config && !projectHomePath.startsWith(process.cwd())) {
        if (framework) {
            const CopyPlugin = require('copy-webpack-plugin');
            const to = join(config.output.get('path'), '..', '..', FRONTEND_TARGET, 'dist');
            rimraf.sync(to);
            config
                .plugin('copyFrontend')
                .use(CopyPlugin, [{
                    patterns: [{
                        from: join(process.cwd(), framework.settings?.outputDir || 'dist'),
                        to
                    }]
                }]);
        }

    }
};
