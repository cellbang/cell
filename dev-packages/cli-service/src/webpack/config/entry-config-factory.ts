
import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@malagu/cli-common/lib/utils/config-util';
import * as path from 'path';
import * as WebpackChain from '@gem-mine/webpack-chain';

export class EntryConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const { pkg, cfg, dev, entry: e } = context;
        const c = ConfigUtil.getConfig(cfg, target);
        let { entry, devEntry } = c;
        delete c.entry;
        delete c.devEntry;

        if (dev) {
            entry = devEntry || entry;
        }

        entry = e || entry;
        if (e) {
            try {
                entry = pkg.resolveModule((e as string).split(path.sep).join('/'));
            } catch (error) {
                entry = path.resolve(pkg.projectPath, e as string);
            }
        }

        config.entry('index').add(entry.path ? entry.path : entry);
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }

}
