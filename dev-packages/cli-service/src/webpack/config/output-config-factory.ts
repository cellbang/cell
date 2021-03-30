
import { BACKEND_TARGET, CliContext, getHomePath } from '@malagu/cli-common';
import * as path from 'path';
import * as WebpackChian from 'webpack-chain';

export class OutputConfigFactory {
    create(config: WebpackChian, context: CliContext, target: string) {
        const { pkg, dev, output } = context;
        const outputPath = output ? path.resolve(pkg.projectPath, output) : path.join(getHomePath(pkg, target), 'dist');

        config.output.path(outputPath);

        if (BACKEND_TARGET === target) {
            config
                .output
                    .filename('index.js')
                    .libraryTarget('umd')
                    .devtoolModuleFilenameTemplate(dev ? '[absolute-resource-path]' : undefined);
        } else {
            config
                .output
                    .filename('[name].[chunkhash].js');
        }
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

