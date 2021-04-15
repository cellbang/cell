
import { getConfig, CliContext } from '@malagu/cli-common';
import * as path from 'path';
import * as WebpackChain from 'webpack-chain';

export class EntryConfigFactory {
    create(config: WebpackChain, context: CliContext, target: string) {
        const { pkg, cfg, dev, entry: e } = context;
        let { entry, devEntry } = getConfig(cfg, target);

        if (dev) {
            entry = devEntry || entry;
        }

        entry = e || entry;
        try {
            entry = pkg.resolveModule((entry as string).split(path.sep).join('/'));
        } catch (error) {
            entry = path.resolve(pkg.projectPath, entry as string);
        }

        config.entry('index').add(entry);
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }

}
