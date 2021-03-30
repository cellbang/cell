
import { getWebpackConfig, CliContext } from '@malagu/cli-common';
import * as WebpackChian from 'webpack-chain';

export class MalaguYamlConfigFactory {
    create(config: WebpackChian, context: CliContext, target: string) {
        const { cfg } = context;
        config.merge(getWebpackConfig(cfg, target).config || {});
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}
