import { BuildContext, BACKEND_TARGET, getConfig, getHomePath } from '@malagu/cli';
import { join } from 'path';
import { writeFile } from 'fs-extra';

export default async (context: BuildContext) => {
    const { pkg } = context;
    const deployConfig = getConfig(pkg, BACKEND_TARGET).deployConfig;
    if (deployConfig.type === 'custom') {
        const destDir = join(getHomePath(pkg), 'bootstrap');
        const bootstrap = deployConfig.function.bootstrap;
        delete deployConfig.function.bootstrap;

        await writeFile(destDir, `#!/bin/bash\n${bootstrap}`, { mode: 0o755 });
    }

};
