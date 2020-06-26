
import { HookContext } from '../../context';
import { BACKEND_TARGET } from '../../constants';
import * as path from 'path';
import { getHomePath } from '../utils';

export class OutputConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { pkg, dev, output } = context;
        const outputPath = output ? path.resolve(pkg.projectPath, output) : path.join(getHomePath(pkg, target), 'dist');

        const baseOutputConfig = {
            path: outputPath
        };

        if (BACKEND_TARGET === target) {
            return {
                output: {
                    ...baseOutputConfig,
                    filename: 'index.js',
                    libraryTarget: 'umd',
                    devtoolModuleFilenameTemplate: dev ? '[absolute-resource-path]' : undefined
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

    support(context: HookContext, target: string): boolean {
        return true;
    }
}

