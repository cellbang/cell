import { BuildContext, getHomePath } from '@malagu/cli-service';
import { join } from 'path';
import { writeFile } from 'fs-extra';
import { FaaSAdapterUtils } from '@malagu/faas-adapter/lib/hooks';

export default async (context: BuildContext) => {
    const { pkg, cfg } = context;
    const adapterConfig = FaaSAdapterUtils.getConfiguration<any>(cfg);
    if (adapterConfig.function?.runtime === 'custom') {
        const destDir = join(getHomePath(pkg), 'bootstrap');
        const bootstrap = adapterConfig.function.bootstrap;
        delete adapterConfig.function.bootstrap;

        await writeFile(destDir, `#!/bin/bash\n${bootstrap}`, { mode: 0o755 });
    }

};
