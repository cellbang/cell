import { getMalaguHomePath } from '@malagu/cli-common/lib/util';
import { existsSync, readdir, readJSON } from 'fs-extra';
import { join } from 'path';

export interface Runtime {
    name: string;
    version: string;
    description?: string;
}

export async function getInstalledRuntimes() {
    const runtimesPath = join(getMalaguHomePath(), 'runtimes');
    const result: Runtime[] = [];

    if (existsSync(runtimesPath)) {
        const runtimes = await readdir(runtimesPath);
        for (const runtime of runtimes) {
            const packageJsonPath = join(runtimesPath, runtime, 'package.json');
            if (existsSync(packageJsonPath)) {
                const packageJson = await readJSON(packageJsonPath, { encoding: 'utf8' });
                result.push({
                    name: runtime,
                    version: packageJson.version,
                    description: packageJson.description
                });
            }

        }
    }
    return result;
}
