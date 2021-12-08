import { BuildContext, PathUtil } from '@malagu/cli-common';
import { join } from 'path';
import { writeFile } from 'fs-extra';
import { CloudUtils } from '@malagu/cloud-plugin';

export default async (context: BuildContext) => {
    const { cfg, runtime } = context;
    const faasConfig = CloudUtils.getConfiguration(cfg).faas;

    if (faasConfig.function?.type === 'HTTP') {
        const destDir = join(PathUtil.getProjectDistPath(runtime), 'scf_bootstrap');
        const bootstrap = faasConfig.function.bootstrap;
        delete faasConfig.function.bootstrap;

        await writeFile(destDir, `#!/bin/bash\n${bootstrap}`, { mode: 0o755 });
    } else {
        const destDir = join(PathUtil.getProjectDistPath(runtime), 'index.js');
        await writeFile(destDir, `const code = require('./backend');
    module.exports.handler = (event, context) => {
        return code.handler(event, context);
    }`, { mode: 0o755 });

    }

};
