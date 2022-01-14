import { BuildContext, PathUtil } from '@malagu/cli-common';
import { join } from 'path';
import { writeFile, ensureDir } from 'fs-extra';
import { CloudUtils } from '@malagu/cloud-plugin';
import { getCodeRootDir } from '@malagu/code-loader-plugin';

export default async (context: BuildContext) => {
    const { cfg } = context;
    const config = CloudUtils.getConfiguration(cfg);
    const codeRootDir = getCodeRootDir(PathUtil.getProjectDistPath(), config.function.codeUri);
    ensureDir(codeRootDir);
    if (config.function?.runtime === 'custom') {
        const destDir = join(codeRootDir, 'bootstrap');
        const bootstrap = config.function.bootstrap;
        delete config.function.bootstrap;

        await writeFile(destDir, `#!/bin/bash\n${bootstrap}`, { mode: 0o755 });
    }

};
