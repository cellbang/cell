import { spawnProcess } from '@malagu/cli-common/lib/packager';
import { pathExistsSync } from 'fs-extra';
import { PythonPluginOptions } from '../python-plugin-protocol';
import { join } from 'path';
import { release } from 'os';
const isWsl = require('is-wsl');

export async function dockerCommand(options: string[], { stdio }: { stdio?: string } = {}) {
    const cmd = 'docker';
    return spawnProcess(cmd, options, { encoding: 'utf-8', stdio });
}

export async function buildImage(dockerFile: string, extraArgs: string[], pluginOptions: PythonPluginOptions) {
    const imageName = 'sls-py-reqs-custom';
    const options = ['build', '-f', dockerFile, '-t', imageName];

    if (Array.isArray(extraArgs)) {
        options.push(...extraArgs);
    } else {
        throw new Error('dockerRunCmdExtraArgs option must be an array');
    }

    options.push('.');

    await dockerCommand(options, { stdio: 'inherit' });
    return imageName;
}

export function findTestFile(servicePath: string, options: PythonPluginOptions) {
    if (pathExistsSync(join(servicePath, 'requirements.txt'))) {
        return 'requirements.txt';
    }
    throw new Error('Unable to find requirements.txt for getBindPath()');
}

async function tryBindPath(bindPath: string, testFile: string, pluginOptions: PythonPluginOptions) {
    const debug = process.env.MALAGU_DEBUG;
    const options = [
        'run',
        '--rm',
        '-v',
        `${bindPath}:/test`,
        'alpine',
        'ls',
        `/test/${testFile}`,
    ];
    try {
        if (debug) {
            console.info(`Trying bindPath ${bindPath} (${options})`);
        }
        const { stdout } = await dockerCommand(options);

        return stdout.toString().trim() === `/test/${testFile}`;
    } catch (err) {
        if (debug) {
            console.debug(`Finding bindPath failed with ${err}`);
        }
        return false;
    }
}

export async function getBindPath(servicePath: string, options: PythonPluginOptions) {
    // Determine bind path
    const isWsl1 = isWsl && !release().includes('microsoft-standard');
    if (process.platform !== 'win32' && !isWsl1) {
        return servicePath;
    }

    // test docker is available
    await dockerCommand(['version']);

    // find good bind path for Windows
    const bindPaths = [];
    let baseBindPath = servicePath.replace(/\\([^\s])/g, '/$1');
    let drive;
    let path;

    bindPaths.push(baseBindPath);
    if (baseBindPath.startsWith('/mnt/')) {
        // cygwin "/mnt/C/users/..."
        baseBindPath = baseBindPath.replace(/^\/mnt\//, '/');
    }
    if (baseBindPath[1] === ':') {
        // normal windows "c:/users/..."
        drive = baseBindPath[0];
        path = baseBindPath.substring(3);
    } else if (baseBindPath[0] === '/' && baseBindPath[2] === '/') {
        // gitbash "/c/users/..."
        drive = baseBindPath[1];
        path = baseBindPath.substring(3);
    } else {
        throw new Error(`Unknown path format ${baseBindPath.substring(10)}...`);
    }

    bindPaths.push(`/${drive.toLowerCase()}/${path}`); // Docker Toolbox (seems like Docker for Windows can support this too)
    bindPaths.push(`${drive.toLowerCase()}:/${path}`); // Docker for Windows
    // other options just in case
    bindPaths.push(`/${drive.toUpperCase()}/${path}`);
    bindPaths.push(`/mnt/${drive.toLowerCase()}/${path}`);
    bindPaths.push(`/mnt/${drive.toUpperCase()}/${path}`);
    bindPaths.push(`${drive.toUpperCase()}:/${path}`);

    const testFile = findTestFile(servicePath, options);

    for (let i = 0; i < bindPaths.length; i++) {
        const bindPath = bindPaths[i];
        if (await tryBindPath(bindPath, testFile, options)) {
            return bindPath;
        }
    }

    throw new Error('Unable to find good bind path format');
}

export async function getDockerUid(bindPath: string) {
    const options = [
        'run',
        '--rm',
        '-v',
        `${bindPath}:/test`,
        'alpine',
        'stat',
        '-c',
        '%u',
        '/bin/sh',
    ];
    const { stdout } = await dockerCommand(options);
    return stdout.trim();
}

