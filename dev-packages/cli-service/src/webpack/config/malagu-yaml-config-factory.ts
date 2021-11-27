
import { ConfigUtil, CliContext } from '@malagu/cli-common';
import * as WebpackChain from 'webpack-chain';

export class MalaguYamlConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const { cfg } = context;
        config.merge(ConfigUtil.getWebpackConfig(cfg, target).config || {});
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}
