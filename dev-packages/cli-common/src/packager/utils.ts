import { NPM } from './npm';
import { Yarn } from './yarn';

import { spawn, spawnSync } from 'child_process';
import { hasProjectYarn, hasProjectNpm, hasYarn, hasProjectPnpm, hasPnpm } from '../env/env';
import { Packager } from '../packager/packager-protocol';
import { Pnpm } from './pnpm';

export class SpawnError extends Error {
    constructor(message: string, public stdout: any, public stderr: any) {
        super(message);
    }

    override toString() {
        return `${this.message}\n${this.stderr}`;
    }
}

export function spawnProcess(command: string, args: string[], options: any) {
    return new Promise<any>((resolve, reject) => {
        if (options && options.stdio === 'inherit') {
            spawnSync(command, args, { shell: true, ...options });
            resolve({});
        } else {
            const child = spawn(command, args, { shell: true, ...options });
            let stdout = '';
            let stderr = '';
            child.stdout.setEncoding('utf8');
            child.stderr.setEncoding('utf8');
            child.stdout.on('data', (data: any) => {
                stdout += data;
            });
            child.stderr.on('data', (data: any) => {
                stderr += data;
            });
            child.on('error', (err: any) => {
                reject(err);
            });
            child.on('close', (exitCode: number) => {
                if (exitCode !== 0) {
                    reject(new SpawnError(`${command} ${args.join(' ')} failed with code ${exitCode}`, stdout, stderr));
                } else {
                    resolve({ stdout, stderr });
                }
            });
        }
    });
}

export function getPackager(packagerId?: 'pnpm' | 'yarn' | 'npm', cwd = process.cwd()): Packager {
    const registeredPackagers = {
        npm: new NPM(),
        yarn: new Yarn(),
        pnpm: new Pnpm(),
    };
    if (!packagerId) {
        if (hasProjectYarn(cwd)) {
            packagerId = 'yarn';
        } else if (hasProjectPnpm(cwd)) {
            packagerId = 'pnpm';
        } else if (hasProjectNpm(cwd)) {
            packagerId = 'npm';
        } else if (hasYarn()) {
            packagerId = 'yarn';
        } else if (hasPnpm()) {
            packagerId = 'pnpm';
        } else {
            packagerId = 'npm';
        }
    }
    if (packagerId in registeredPackagers) {
        return registeredPackagers[packagerId];
    }
    const message = `Could not find packager '${packagerId}'`;
    console.log(`ERROR: ${message}`);
    throw new Error(message);
}
