import { spawnProcess, SpawnError } from './utils';
import { moveSync, readFile, removeSync, writeFile } from 'fs-extra';
import { Packager , InstallOptions, PruneOptions, AddOptions} from './packager-protocol';
const path = require('path');

export class Pnpm implements Packager {
    get lockfileName() {
        return 'pnpm-lock.yaml';
    }

    get copyPackageSectionNames() {
        return ['pnpm'];
    }

    get mustCopyModules() {
        return false;
    }

    async getProdDependencies(depth: number, cwd = process.cwd()) {
        const command = /^win/.test(process.platform) ? 'pnpm.cmd' : 'pnpm';
        const args = ['list', `--depth=${depth || 1}`, '--json', '--production'];
        // If we need to ignore some errors add them here
        const ignoredPnpmErrors: any[] = [];
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
                        !ignoredPnpmErrors.some(ignoredError => error.startsWith(error, `npm ERR! ${ignoredError.npmError}`))
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
        return readFile(lockfilePath, 'utf8');
    }

    writeLockfile(lockfilePath: string, content: string) {
        return writeFile(lockfilePath, content, 'utf8');
    }

    rebaseLockfile(pathToPackageRoot: string, lockfile: string) {
        return lockfile;
    }

    async install(opts?: InstallOptions, cwd = process.cwd()) {
        const command = /^win/.test(process.platform) ? 'pnpm.cmd' : 'pnpm';
        let args: string[];

        // use --filter option to support pnpm workspace
        if (this.isWorkspace(opts)) {
            args = ['deploy'];

            // options for workspace
            args.push(`--filter=${opts.filter}`);
            args.push('--prod');
        } else {
            args = ['install'];

            // options for no-workspace
            if (opts?.ignoreWorkspace) {
                args.push('--ignore-workspace');
            }
        }

        // Convert supported packagerOptions
        if (opts?.ignoreScripts) {
            args.push('--ignore-scripts');
        }
        if (opts?.frozenLockfile) {
            args.push('--frozen-lockfile');
        }

        if (opts?.filter) {
            const tempDeployDir = '.temp-deploy';
            args.push(tempDeployDir);

            await spawnProcess(command, args, { cwd, stdio: opts?.stdio || 'inherit' });

            removeSync(path.join(cwd, 'node_modules'));
            moveSync(path.join(cwd, tempDeployDir, 'node_modules'), path.join(cwd, 'node_modules'));
            removeSync(path.join(cwd, tempDeployDir));
        } else {
            return spawnProcess(command, args, { cwd, stdio: opts?.stdio || 'inherit' });
        }
    }

    add(packages: string[], opts?: AddOptions, cwd = process.cwd()) {
        const command = /^win/.test(process.platform) ? 'pnpm.cmd' : 'pnpm';
        const args = ['add', ...packages];
        if (opts?.exact) {
            args.push('--save-exact');
        }
        if (opts?.dev) {
            args.push('--save-dev');
        }
        if (opts?.global) {
            args.push('-g');
        }
        return spawnProcess(command, args, { cwd, stdio: opts?.stdio || 'inherit' });
    }

    async prune(opts?: PruneOptions, cwd = process.cwd()) {
        const command = /^win/.test(process.platform) ? 'pnpm.cmd' : 'pnpm';
        const args = ['prune'];

        if (!this.isWorkspace(opts)) {
            return spawnProcess(command, args, { cwd, stdio: opts?.stdio || 'inherit'  });
        }
    }

    runScripts(scriptNames: string[], cwd = process.cwd()) {
        const command = /^win/.test(process.platform) ? 'pnpm.cmd' : 'pnpm';
        const promises = scriptNames.map(scriptName => {
            const args = ['run', scriptName];
            return spawnProcess(command, args, { cwd });
        });
        return Promise.all(promises);
    }

    isWorkspace(opts?: InstallOptions | PruneOptions): opts is { filter: string} {
        return !!opts?.filter;
    }
}
