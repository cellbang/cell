
import { CliContext } from '../../context';
import { getWebpackConfig } from '../utils';

export class MalaguYamlConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { pkg } = context;
        return getWebpackConfig(pkg, target).config || {};
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}
