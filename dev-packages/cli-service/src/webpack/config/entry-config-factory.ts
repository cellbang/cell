
import { CliContext } from '@celljs/cli-common/lib/context/context-protocol';
import { ConfigUtil } from '@celljs/cli-common/lib/utils/config-util';
import { EMPTY } from '@celljs/cli-common/lib/constants';
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

        let entryPath = entry?.path ? entry.path : entry;

        entryPath = e || entryPath;
        if (entryPath === EMPTY) {
            entryPath = path.resolve(__dirname, 'empty-entry.js');
        }
        if (e) {
            try {
                entryPath = pkg.resolveModule((e as string).split(path.sep).join('/'));
            } catch (error) {
                entryPath = path.resolve(pkg.projectPath, e as string);
            }
        }

        config.entry('index').add(entryPath);
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }

}
