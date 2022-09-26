import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import { PathUtil } from '@malagu/cli-common/lib/utils/path-util';
import { existsSync, remove } from 'fs-extra';
import { join } from 'path';

export async function after(ctx: CliContext) {

    const genEntry = join(PathUtil.getBackendProjectDistPath(), 'gen-entry.js');
    if (existsSync(genEntry)) {
        remove(genEntry);
    }
};
