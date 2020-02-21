import { spawnProcess, SpawnError } from './utils';
import { readJSON, writeJSON } from 'fs-extra';

export class NPM {
    get lockfileName() {
        return 'package-lock.json';
    }

    get copyPackageSectionNames() {
        return [];
    }

    get mustCopyModules() {
        return true;
    }

    async getProdDependencies(cwd: string, depth: number) {
        // Get first level dependency graph
        const command = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
        const args = [
            'ls',
            '-prod', // Only prod dependencies
            '-json',
            `-depth=${depth || 1}`
        ];

        const ignoredNpmErrors = [
            { npmError: 'extraneous', log: false },
            { npmError: 'missing', log: false },
            { npmError: 'peer dep missing', log: true }
        ];

        let processOutput: any;
        try {
            processOutput = await spawnProcess(command, args, { cwd: cwd });
        } catch (err) {
            if (err instanceof SpawnError) {
                // Only exit with an error if we have critical npm errors for 2nd level inside
                const errors = err.stderr ? err.stderr.split('\n') : [];
                const failed = errors.reduce((f: boolean, error: any) => {
                    if (f) {
                        return true;
                    }
                    return (
                        error &&
                        !ignoredNpmErrors.some(ignoredError => error.startsWith(error, `npm ERR! ${ignoredError.npmError}`))
                    );
                },
                false
                );

                if (!failed && !err.stdout) {
                    processOutput = { stdout: err.stdout };
                }
            } else {
                throw err;
            }

        }
        return JSON.parse(processOutput.stdout);
    }

    readLockfile(lockfilePath: string) {
        return readJSON(lockfilePath);
    }

    writeLockfile(lockfilePath: string, content: any) {
        return writeJSON(lockfilePath, content, { spaces: 2 });
    }

    _rebaseFileReferences(pathToPackageRoot: string, moduleVersion: string) {
        if (/^file:[^/]{2}/.test(moduleVersion)) {
            const filePath = moduleVersion.replace(/^file:/, '');
            return `file:${pathToPackageRoot}/${filePath}`.replace(/\\/g, '/');
        }

        return moduleVersion;
    }

    /**
     * We should not be modifying 'package-lock.json'
     * because this file should be treated as internal to npm.
     *
     * Rebase package-lock is a temporary workaround and must be
     * removed as soon as https://github.com/npm/npm/issues/19183 gets fixed.
     */
    rebaseLockfile(pathToPackageRoot: string, lockfile: any) {
        if (lockfile.version) {
            lockfile.version = this._rebaseFileReferences(pathToPackageRoot, lockfile.version);
        }

        if (lockfile.dependencies) {
            for (const lockedDependency of lockfile.dependencies) {
                this.rebaseLockfile(pathToPackageRoot, lockedDependency);
            }
        }

        return lockfile;
    }

    install(cwd: string) {
        const command = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
        const args = ['install'];
        return spawnProcess(command, args, { cwd, stdio: 'inherit' });
    }

    prune(cwd: string) {
        const command = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
        const args = ['prune'];

        return spawnProcess(command, args, { cwd });
    }

    runScripts(cwd: string, scriptNames: string[]) {
        const command = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
        const promises = scriptNames.map(scriptName => {
            const args = ['run', scriptName];
            return spawnProcess(command, args, { cwd });
        });
        return Promise.all(promises);
    }
}
