
import { BACKEND_TARGET } from '@celljs/cli-common/lib/constants';
import { CliContext } from '@celljs/cli-common/lib/context/context-protocol';
import { PathUtil } from '@celljs/cli-common/lib/utils/path-util';
import * as path from 'path';
import * as WebpackChain from '@gem-mine/webpack-chain';

export class OutputConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const { dev, outputDir } = context;
        if (outputDir) {
            PathUtil.setProjectHomePath(path.join(process.cwd(), outputDir));
        }
        const outputPath = path.join(PathUtil.getProjectDistPathForTarget(target));
        if (!config.output.get('path')) {
            config.output.path(outputPath);
        }
        if (BACKEND_TARGET === target) {    // for backend
            config
                .output
                    .filename('index.js')
                    .libraryTarget('umd')
                    .devtoolModuleFilenameTemplate(dev ? '[absolute-resource-path]' : '');
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

