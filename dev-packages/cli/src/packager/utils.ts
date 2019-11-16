import { NPM } from './npm';
import { Yarn } from './yarn';

import { spawn, spawnSync } from 'child_process';

export class SpawnError extends Error {
    constructor(message: string, public stdout: any, public stderr: any) {
        super(message);
    }

    toString() {
        return `${this.message}\n${this.stderr}`;
    }
}

export function spawnProcess(command: string, args: string[], options: any) {
    return new Promise<any>((resolve, reject) => {
        if (options && options.stdio === 'inherit') {
            spawnSync(command, args, options);
            resolve({});
        } else {
            const child = spawn(command, args, options);
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

export function getPackager(packagerId: string = 'yarn'): NPM | Yarn {
    const registeredPackagers = {
        npm: new NPM(),
        yarn: new Yarn()
    };
    if (packagerId in registeredPackagers) {
        return (registeredPackagers as any)[packagerId];
    }
    const message = `Could not find packager '${packagerId}'`;
    console.log(`ERROR: ${message}`);
    throw new Error(message);
}
