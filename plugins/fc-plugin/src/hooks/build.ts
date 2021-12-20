import { BuildContext, PathUtil } from '@malagu/cli-common';
import { join } from 'path';
import { writeFile } from 'fs-extra';
import { CloudUtils } from '@malagu/cloud-plugin';

export default async (context: BuildContext) => {
    const { cfg } = context;
    const faasConfig = CloudUtils.getConfiguration(cfg).faas;
    if (faasConfig.function?.runtime === 'custom') {
        const destDir = join(PathUtil.getProjectDistPath(), 'bootstrap');
        const bootstrap = faasConfig.function.bootstrap;
        delete faasConfig.function.bootstrap;

        await writeFile(destDir, `#!/bin/bash\n${bootstrap}`, { mode: 0o755 });
    }

};
