import { getRuntimePath, getMalaguHomePath } from '@malagu/cli-common/lib/util';
import { existsSync, readdir, readJSON } from 'fs-extra';
import { join } from 'path';
import installRuntime from '../install/install';

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

export async function installRuntimeIfNeed(runtime: string): Promise<void> {
    const runtimePath = getRuntimePath(runtime);
    if (!existsSync(runtimePath)) {
        await installRuntime({ runtime });
    }
}
