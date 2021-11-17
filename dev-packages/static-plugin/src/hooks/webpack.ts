import { ConfigurationContext, FRONTEND_TARGET, WebpackContext, getProjectHomePath } from '@malagu/cli-service';
import { join } from 'path';
import { frameworks, FrameworkUtils } from '@malagu/frameworks';
const rimraf = require('rimraf');

export default async (context: WebpackContext) => {
    const { configurations, cfg } = context;
    const config = ConfigurationContext.getBackendConfiguration(
        configurations
    );
    const projectHomePath = getProjectHomePath();
    if (config && !projectHomePath.startsWith(process.cwd())) {
        const framework = await FrameworkUtils.detect(frameworks);
        if (framework) {
            const CopyPlugin = require('copy-webpack-plugin');
            const to = join(config.output.get('path'), '..', '..', FRONTEND_TARGET, 'dist');
            rimraf.sync(to);
            config
                .plugin('copyFrontend')
                .use(CopyPlugin, [{
                    patterns: [{
                        from: join(process.cwd(), framework.outputDir || 'dist'),
                        to,
                        transform(content: Buffer, absoluteFrom: string) {
                            if (absoluteFrom.endsWith('index.html')) {
                                return content.toString('utf8').replace(/<head>/i, `<head><base href='${cfg.frontendConfig.malagu.server.path}'/>`);
                            }
                            return content;
                        }
                    }]
                }]);
        }

    }
};
