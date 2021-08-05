import { BuildContext, getProjectHomePath } from '@malagu/cli-service';
import { join } from 'path';
import { writeFile } from 'fs-extra';
import { FaaSAdapterUtils } from '@malagu/faas-adapter/lib/hooks';

export default async (context: BuildContext) => {
    const { cfg } = context;
    const adapterConfig = FaaSAdapterUtils.getConfiguration<any>(cfg);
    if (adapterConfig.function?.runtime === 'custom') {
        const destDir = join(getProjectHomePath(), 'bootstrap');
        const bootstrap = adapterConfig.function.bootstrap;
        delete adapterConfig.function.bootstrap;

        await writeFile(destDir, `#!/bin/bash\n${bootstrap}`, { mode: 0o755 });
    }

};
