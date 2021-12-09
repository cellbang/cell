import { PathUtil, CommandUtil, SettingsUtil } from '@malagu/cli-common';
import { existsSync, readdir, readJSON } from 'fs-extra';
import { join } from 'path';
import { FrameworkUtil } from '@malagu/frameworks';
import installRuntime from '../install/install';
import { Runtimes } from '../runtime-protocol';

export interface Runtime {
    name: string;
    version: string;
    description?: string;
}

export namespace RuntimeUtil {
    export async function initRuntime() {
        const settings = SettingsUtil.getSettings();
        const framework = await FrameworkUtil.detect({
            url: settings.frameworks?.url,
            upstreamUrl: settings.frameworks?.upstreamUrl
        });
        const pkg = CommandUtil.getPkg(settings);
        let runtime = pkg.rootComponentPackage.malaguComponent?.runtime;
        runtime = runtime || settings.defaultRuntime;
        if (runtime) {
            await installRuntimeIfNeed(runtime);
        } else {
            if (framework) {
                runtime = framework.useRuntime;
                if (runtime && runtime !== Runtimes.empty) {
                    await installRuntimeIfNeed(runtime);
                }
            }
        }
        return {
            settings,
            runtime,
            framework: framework?.useRuntime === runtime ? framework : undefined
        };

    }

    export async function initRuntimeAndLoadContext(projectPath?: string) {
        const { settings, framework, runtime } = await initRuntime();
        return CommandUtil.loadContext(settings, framework, runtime, projectPath);
    }

    export async function getInstalledRuntimes() {
        const runtimesPath = join(PathUtil.getMalaguHomePath(), 'runtimes');
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
        const runtimePath = PathUtil.getRuntimePath(runtime);
        if (!existsSync(runtimePath)) {
            await installRuntime({ runtime });
        }
    }

}

