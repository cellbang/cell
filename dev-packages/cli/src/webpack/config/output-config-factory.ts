
import { CliContext } from '../../context';
import { BACKEND_TARGET } from '../../constants';
import * as path from 'path';

export class OutputConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { pkg, dest } = context;
        const outputPath = path.resolve(pkg.projectPath, dest || 'dist', target);

        const baseOutputConfig = {
            path: outputPath
        };

        if (BACKEND_TARGET === target) {
            return {
                output: {
                    ...baseOutputConfig,
                    filename: 'index.js',
                    libraryTarget: 'umd',
                    devtoolModuleFilenameTemplate: '[absolute-resource-path]'
                }
            };
        } else {
            return {
                output: {
                    ...baseOutputConfig,
                    filename: '[name].[chunkhash].js'
                }
            };
        }
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

