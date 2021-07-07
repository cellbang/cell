import { BuildContext, getHomePath } from '@malagu/cli-service';
import { join } from 'path';
import { writeFile } from 'fs-extra';
import { FaaSAdapterUtils } from '@malagu/faas-adapter/lib/hooks';

export default async (context: BuildContext) => {
    const { pkg, cfg } = context;
    const adapterConfig = FaaSAdapterUtils.getConfiguration<any>(cfg);

    if (adapterConfig.function?.type === 'HTTP') {
        const destDir = join(getHomePath(pkg), 'scf_bootstrap');
        const bootstrap = adapterConfig.function.bootstrap;
        delete adapterConfig.function.bootstrap;

        await writeFile(destDir, `#!/bin/bash\n${bootstrap}`, { mode: 0o755 });
    } else {
        const destDir = join(getHomePath(pkg), 'index.js');
        await writeFile(destDir, `const code = require('./backend/dist');
    module.exports.handler = (event, context) => {
        return code.handler(event, context);
    }`, { mode: 0o755 });

    }

};
