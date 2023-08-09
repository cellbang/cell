import { BuildContext, PathUtil } from '@malagu/cli-common';
import { join } from 'path';
import { writeFile, ensureDir } from 'fs-extra';
import { CloudUtils } from '@malagu/cloud-plugin';
import { getCodeRootDir } from '@malagu/code-loader-plugin';

export default async (context: BuildContext) => {
    const { cfg } = context;
    const cloudConfig = CloudUtils.getConfiguration(cfg);
    const codeRootDir = getCodeRootDir(PathUtil.getProjectDistPath(), cloudConfig.function.codeUri);
    await ensureDir(codeRootDir);
    if (cloudConfig.function?.type === 'HTTP') {
        const destDir = join(codeRootDir, 'scf_bootstrap');
        const bootstrap = cloudConfig.function.bootstrap;
        delete cloudConfig.function.bootstrap;
        await writeFile(destDir, `#!/bin/bash\n${bootstrap}`, { mode: 0o755 });
    } else {
        const destDir = join(codeRootDir, 'index.js');

        if (cloudConfig.function?.callbackWaitsForEmptyEventLoop) {
            await writeFile(destDir, `const code = require('./backend');
            module.exports.handler = (event, context) => {
                code.handler(event, context);
            }`, { mode: 0o755 });
        } else {
            await writeFile(destDir, `const code = require('./backend');
            module.exports.handler = (event, context) => {
                return code.handler(event, context);
            }`, { mode: 0o755 });
        }

    }

};
