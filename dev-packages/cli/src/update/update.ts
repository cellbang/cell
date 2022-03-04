import { getPackager } from '@malagu/cli-common/lib/packager/utils';
import { CliContext } from '@malagu/cli-common/lib/context/context-protocol';
import { join } from 'path';
import { readJSON, existsSync, writeJSON } from 'fs-extra';
const updateNotifier = require('update-notifier');
const pkg = require('../../package.json');
const semver = require('semver');

export interface UpdateOptions {
    version?: string;
    distTag?: string;
    skipIntallingComponent?: boolean;
}

async function updatePackage(version: string, skipIntallingComponent?: boolean) {
    const packagePath = join(process.cwd(), 'package.json');
    if (existsSync(packagePath)) {
        const projectPkg = await readJSON(packagePath);
        const dependencies = projectPkg.dependencies ?? {};
        const devDependencies = projectPkg.devDependencies ?? {};
        for (const name of Object.keys(dependencies)) {
            if (name.startsWith('@malagu/')) {
                dependencies[name] = version;
            }
        }

        for (const name of Object.keys(devDependencies)) {
            if (name.startsWith('@malagu/')) {
                devDependencies[name] = version;
            }
        }
        await writeJSON(packagePath, projectPkg, { spaces: 2 });
        if (skipIntallingComponent) {
            await getPackager().install();
        }
    }
}

export default async (cliContext: CliContext, options: UpdateOptions) => {
    try {
        const version = options.version;
        if (version) {
            if (version !== pkg.version) {
                await updatePackage(version, options.skipIntallingComponent);
                await getPackager('npm').add([`${pkg.name}@${version}`], { global: true });
            }
        } else {
            const notifier = updateNotifier({ pkg, distTag: options.distTag });
            const { latest, current } = await notifier.fetchInfo();
            if (semver.gt(latest, current)) {
                await updatePackage(latest, options.skipIntallingComponent);
                await getPackager('npm').add([`${pkg.name}@${latest}`], { global: true });
            }
        }
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
