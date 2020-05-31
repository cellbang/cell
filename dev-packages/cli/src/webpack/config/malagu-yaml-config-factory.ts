
import { HookContext } from '../../context';
import { getWebpackConfig } from '../utils';

export class MalaguYamlConfigFactory {
    create(config: any, context: HookContext, target: string) {
        const { pkg } = context;
        return getWebpackConfig(pkg, target).config || {};
    }

    support(context: HookContext, target: string): boolean {
        return true;
    }
}
