import { BuildContext, PathUtil } from '@malagu/cli-common';
import { join } from 'path';
import { writeFile } from 'fs-extra';
import { CloudUtils } from '@malagu/cloud-plugin';

export default async (context: BuildContext) => {
    const { cfg } = context;
    const config = CloudUtils.getConfiguration(cfg);
    if (config.function?.runtime === 'custom') {
        const destDir = join(PathUtil.getProjectDistPath(), 'bootstrap');
        const bootstrap = config.function.bootstrap;
        delete config.function.bootstrap;

        await writeFile(destDir, `#!/bin/bash\n${bootstrap}`, { mode: 0o755 });
    }

};
