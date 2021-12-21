import { BuildContext, PathUtil } from '@malagu/cli-common';
import { join } from 'path';
import { writeFile } from 'fs-extra';
import { CloudUtils } from '@malagu/cloud-plugin';

export default async (context: BuildContext) => {
    const { cfg } = context;
    const cloudConfig = CloudUtils.getConfiguration(cfg);

    if (cloudConfig.function?.type === 'HTTP') {
        const destDir = join(PathUtil.getProjectDistPath(), 'scf_bootstrap');
        const bootstrap = cloudConfig.function.bootstrap;
        delete cloudConfig.function.bootstrap;

        await writeFile(destDir, `#!/bin/bash\n${bootstrap}`, { mode: 0o755 });
    } else {
        const destDir = join(PathUtil.getProjectDistPath(), 'index.js');
        await writeFile(destDir, `const code = require('./backend');
    module.exports.handler = (event, context) => {
        return code.handler(event, context);
    }`, { mode: 0o755 });

    }

};
