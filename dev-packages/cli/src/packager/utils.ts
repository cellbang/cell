import { NPM } from './npm';
import { Yarn } from './yarn';

const childProcess = require('child_process');

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
        const child = childProcess.spawn(command, args, options);
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
    });
}

const registeredPackagers = {
    npm: NPM,
    yarn: Yarn
};

export function getPackager(packagerId: string) {
    if (packagerId in registeredPackagers) {
        return (registeredPackagers as any)[packagerId];
    }
      const message = `Could not find packager '${packagerId}'`;
      console.log(`ERROR: ${message}`);
      throw new Error(message);
}
