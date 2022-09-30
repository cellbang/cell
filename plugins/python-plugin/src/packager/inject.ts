import { PathUtil } from '@malagu/cli-common/lib/utils';
import { ensureDirSync, copyFileSync } from 'fs-extra';
import { join, relative, dirname } from 'path';
import { PythonPluginOptions } from '../python-plugin-protocol';
import { getRequirementsPath } from './util';
const glob = require('glob-all');

export function injectRequirements(options: PythonPluginOptions) {
    if (options.layer) {
        return;
    }
    const externals = new Set(options.externals || []);
    const requirementsPath = getRequirementsPath();
    const files: string[] = glob.sync([join(requirementsPath, '**')], { mark: true, dot: true });
    files
        .map(file => [file, relative(requirementsPath, file)])
        .filter(([file, relativeFile]) =>
            !file.endsWith('/') &&
            !relativeFile.match(/^__pycache__[\\/]/) &&
            !externals.has(relativeFile.split(/([-\\/]|\.py$|\.pyc$)/, 1)[0])
        )
        .forEach(([file, relativeFile]) => {
            const targetPath = join(PathUtil.getProjectDistPath(), relativeFile);
            ensureDirSync(dirname(targetPath));
            copyFileSync(file, targetPath);
        });
}
