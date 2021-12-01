import { CliContext, PathUtil, ConfigUtil } from '@malagu/cli-common';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs-extra';

export default async (context: CliContext) => {
    const { cfg, runtime } = context;
    const port = ConfigUtil.getBackendMalaguConfig(cfg).server?.port || 3000;
    const content = readFileSync(join(__dirname, '..', 'entry.js'), { encoding: 'utf8' });
    content.replace(/PORT/g, port);
    writeFileSync(join(PathUtil.getBackendProjectHomePath(runtime), 'index.js'), content, { encoding: 'uft8' });
};
