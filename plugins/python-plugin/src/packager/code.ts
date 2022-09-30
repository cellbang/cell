import { PathUtil } from '@malagu/cli-common/lib/utils';
import { ensureDirSync, copyFileSync } from 'fs-extra';
import { join, relative, dirname } from 'path';
import { PythonPluginOptions } from '../python-plugin-protocol';
const glob = require('glob-all');

export function buildCode(options: PythonPluginOptions) {
    const codeDir = process.cwd();

    const files: string[] = glob.sync([join(codeDir, '**'), ...options.codePatterns], { mark: true, dot: true });
    files
        .map(file => [file, relative(codeDir, file)])
        .filter(([file]) => !file.endsWith('/'))
        .forEach(([file, relativeFile]) => {
            const targetPath = join(PathUtil.getProjectDistPath(), relativeFile);
            ensureDirSync(dirname(targetPath));
            copyFileSync(file, targetPath);
        });
}
