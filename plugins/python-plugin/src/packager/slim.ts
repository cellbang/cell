import { removeSync } from 'fs-extra';
import { PythonPluginOptions } from '../python-plugin-protocol';
const isWsl = require('is-wsl');
const glob = require('glob-all');

export function getStripMode(options: PythonPluginOptions) {
    if (options.strip === false || options.slim === false) {
        return 'skip';
    } else if (options.dockerizePip) {
        return 'docker';
    } else if (
        (!isWsl && process.platform === 'win32') ||
        process.platform === 'darwin'
    ) {
        return 'skip';
    } else {
        return 'direct';
    }
}

export function getStripCommand(options: PythonPluginOptions, folderPath: string) {
    return [
        'find',
        folderPath,
        '-name',
        '*.so',
        '-exec',
        'strip',
        '{}',
        ';',
    ];
}

export function deleteFiles(options: PythonPluginOptions, folderPath: string) {
    let patterns = ['**/*.py[c|o]', '**/__pycache__*', '**/*.dist-info*'];
    if (options.slimPatterns) {
        if (options.slimPatternsAppendDefaults === false) {
            patterns = options.slimPatterns;
        } else {
            patterns = patterns.concat(options.slimPatterns);
        }
    }
    for (const pattern of patterns) {
        for (const file of glob.sync(`${folderPath}/${pattern}`)) {
            removeSync(file);
        }
    }
}
