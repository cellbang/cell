
import { HookContext } from '../../context';
import { BACKEND_TARGET } from '../../constants';
import * as path from 'path';
import { getHomePath } from '../utils';

export class OutputConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { pkg } = context;
        const outputPath = path.join(getHomePath(pkg, target), 'dist');

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

    support(context: HookContext, target: string): boolean {
        return true;
    }
}

