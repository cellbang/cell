import { CliContext, PathUtil, ConfigUtil } from '@malagu/cli-common';
import { join } from 'path';
import { renameSync, writeFileSync } from 'fs-extra';

const entryContent =  `
const app = require('./_index');
let target = app;
if (typeof app === 'object' && app.default) {
    target = app.default;
}
if (typeof target === 'function') {
    if (typeof target.listen === 'funtion') {
        target.listen(PORT);
    } else {
        target(PORT);
    }
}
`;

export default async (context: CliContext) => {
    const { cfg, runtime } = context;
    const port = ConfigUtil.getBackendMalaguConfig(cfg).server?.port || 3000;
    const oldIndexPath = join(PathUtil.getBackendProjectHomePath(runtime), 'index.js');
    const newIndexPath = join(PathUtil.getBackendProjectHomePath(runtime), '_index.js');
    renameSync(oldIndexPath, newIndexPath);
    writeFileSync(oldIndexPath, entryContent.replace(/PORT/g, port), { encoding: 'utf8' });
};
