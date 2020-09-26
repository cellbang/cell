import { BuildContext, BACKEND_TARGET, getMalaguConfig, getHomePath } from '@malagu/cli';
import { join } from 'path';
import { writeFile } from 'fs-extra';

export default async (context: BuildContext) => {
    const { pkg, cfg } = context;
    const deployConfig = getMalaguConfig(cfg, BACKEND_TARGET)['fc-adapter'];
    if (deployConfig.type === 'custom') {
        const destDir = join(getHomePath(pkg), 'bootstrap');
        const bootstrap = deployConfig.function.bootstrap;
        delete deployConfig.function.bootstrap;

        await writeFile(destDir, `#!/bin/bash\n${bootstrap}`, { mode: 0o755 });
    }

};
