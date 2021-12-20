import { ConfigUtil, BuildContext, PathUtil } from '@malagu/cli-common';
import { join } from 'path';
import { renameSync, writeFileSync, existsSync } from 'fs-extra';

const entryContent =  `
const path = '{{ path }}';
const port = {{ port }};
process.env.SERVER_PATH = path;
process.env.SERVER_PORT = port;
const app = require('./_index');
let target = app;
if (typeof app === 'object' && app.default) {
    target = app.default;
}
if (target && typeof target.listen === 'function') {
    const server = target.listen(port);
    if (typeof server === 'object') {
        server.timeout = 0;
        server.keepAliveTimeout = 0;
    }
    return;
}

if (typeof target === 'function') {
    target(port);
}
`;

export default async (context: BuildContext) => {
    const { cfg } = context;
    const outputPath = PathUtil.getBackendProjectDistPath();
    const server = ConfigUtil.getBackendMalaguConfig(cfg).server;
    const port = server?.port ?? 9000;
    const path = server?.path ?? '';
    const oldIndexPath = join(outputPath, 'index.js');
    const newIndexPath = join(outputPath, '_index.js');
    if (existsSync(oldIndexPath)) {
        renameSync(oldIndexPath, newIndexPath);
        writeFileSync(oldIndexPath, entryContent.replace(/{{ port }}/g, port).replace(/{{ path }}/g, path), { encoding: 'utf8' });
    }
};
