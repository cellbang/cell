
import { CliContext } from '../../context';
import * as path from 'path';
import { getConfig } from '../utils';

export class EntryConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { pkg, dev } = context;
        let { entry, deployConfig, devEntry } = getConfig(pkg, target);

        if (dev) {
            entry = devEntry || entry;
        }

        const type = deployConfig ? deployConfig.type : undefined;
        if (type && entry && typeof entry !== 'string') {
            entry = entry[type];
        }
        entry = pkg.resolveModule((entry as string).split(path.sep).join('/'));

        return {
            entry
        };
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }

}
