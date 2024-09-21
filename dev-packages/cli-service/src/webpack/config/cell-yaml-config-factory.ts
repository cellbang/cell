
import { CliContext } from '@celljs/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@celljs/cli-common/lib/utils/config-util';
import * as WebpackChain from '@gem-mine/webpack-chain';

export class CellYamlConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const { cfg } = context;
        config.merge(ConfigUtil.getWebpackConfig(cfg, target).config || {});
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}
