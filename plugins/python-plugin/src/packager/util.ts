const Appdir = require('appdirectory');
import { PathUtil } from '@malagu/cli-common/lib/utils';
import { statSync } from 'fs-extra';
import { resolve, join } from 'path';
import { PythonPluginOptions } from '../python-plugin-protocol';
const glob = require('glob-all');
const rimraf = require('rimraf');
const sha256File = require('sha256-file');
const { quote } = require('shell-quote');

export function checkForAndDeleteMaxCacheVersions(options: PythonPluginOptions) {
    // If we're using the static cache, and we have static cache max versions enabled
    if (options.useStaticCache && options.staticCacheMaxVersions > 0) {
        // Get the list of our cache files
        const files: string[] = glob.sync(
            [join(getUserCachePath(options), '*_mlgpyc/')],
            { mark: true }
        );
        // Check if we have too many
        if (files.length >= options.staticCacheMaxVersions) {
            // Sort by modified time
            files.sort((a, b) => {
                return (
                    statSync(a).mtime.getTime() - statSync(b).mtime.getTime()
                );
            });
            // Remove the older files...
            var items = 0;
            for (
                var i = 0; i < files.length - options.staticCacheMaxVersions + 1; i++) {
                rimraf.sync(files[i]);
                items++;
            }

            console.info(`Removed ${items} items from cache because of staticCacheMaxVersions`)
        }
    }
}

export function getRequirementsWorkingPath(subfolder: string, requirementsDir: string, options: PythonPluginOptions) {
    // If we want to use the static cache
    if (options && options.useStaticCache) {
        if (subfolder) {
            subfolder = `${subfolder}_mlgpyc`;
        }
        // If we have max number of cache items...

        return join(getUserCachePath(options), subfolder);
    }

    // If we don't want to use the static cache, then fallback to the way things used to work
    return join(requirementsDir, 'requirements');
}

export function getRequirementsLayerPath(hash: string, options: PythonPluginOptions) {
    // If we want to use the static cache
    if (hash && options && options.useStaticCache) {
        hash = `${hash}_mlgpyc.zip`;
        return join(getUserCachePath(options), hash);
    }
}

/**
 * The static cache path that will be used for this system + options, used if static cache is enabled
 * @param  {Object} options
 * @return {string}
 */
export function getUserCachePath(options?: PythonPluginOptions) {
    // If we've manually set the static cache location
    if (options?.cacheLocation) {
        return resolve(options.cacheLocation);
    }

    // Otherwise, find/use the python-ey appdirs cache location
    const dirs = new Appdir({
        appName: 'malagu-python-plugin-requirements',
        appAuthor: 'UnitedIncome',
    });
    return dirs.userCache();
}

/**
 * Helper to get the md5 a a file's contents to determine if a requirements has a static cache
 * @param  {string} fullpath
 * @return {string}
 */
export function sha256Path(fullpath: string): string {
    return sha256File(fullpath);
}

export function mergeCommands(commands: string[][]) {
    const cmds = filterCommands(commands);
    if (cmds.length === 0) {
        throw new Error('Expected at least one non-empty command');
    } else if (cmds.length === 1) {
        return cmds[0];
    } else {
        // Quote the arguments in each command and join them all using &&.
        const script = cmds.map(quote).join(' && ');
        return ['/bin/sh', '-c', script];
    }
}


function filterCommands(commands: string[][]) {
    return commands.filter(cmd => Boolean(cmd) && cmd.length > 0);
}

export function getRequirementsPath() {
    const projectHomeDir = PathUtil.getProjectHomePath();
    return join(projectHomeDir, `requirements`);
}
