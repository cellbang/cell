import { removeSync, existsSync } from 'fs-extra';
import { PythonPluginOptions } from '../python-plugin-protocol';
import { join } from 'path'
const glob = require('glob-all');
const { getUserCachePath } = require('./shared');


/**
 * Clean up static cache, remove all items in there
 */
export function cleanupCache(options: PythonPluginOptions) {
  const cacheLocation = getUserCachePath(options);
  if (existsSync(cacheLocation)) {
    console.info(`Removing static caches at: ${cacheLocation}`);

    // Only remove cache folders that we added, just incase someone accidentally puts a weird
    // static cache location so we don't remove a bunch of personal stuff
    glob
      .sync([join(cacheLocation, '*mlgpyc/')], { mark: true, dot: false })
      .forEach((file: string) => removeSync(file));
  } else {
    console.info(`No static cache found`);
  }
}

