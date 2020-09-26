
import { CliContext } from '../../context';
import { getWebpackConfig } from '../utils';

export class MalaguYamlConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { cfg } = context;
        return getWebpackConfig(cfg, target).config || {};
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}
