
import { CliContext } from '../../context';
import * as path from 'path';
import { getConfig } from '../utils';

export class EntryConfigFactory {
    create(config: any, context: CliContext, target: string) {
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

        return {
            entry
        };
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }

}
