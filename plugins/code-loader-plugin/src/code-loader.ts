import { readdirSync, statSync, readFileSync } from 'fs-extra';
import * as JSZip from 'jszip';
import { join, resolve } from 'path';
import { CodeLoader, CodeUri } from './code-protocol';

export function getCodeRootDir(codeDir: string, codeUri: string | CodeUri) {
    if (typeof codeUri === 'string') {
        codeUri = { value: codeUri };
    }
    if (codeUri?.value) {
        return resolve(process.cwd(), codeUri.value);
    }
    return codeDir;
}

export class DefaultCodeLoader implements CodeLoader {
    async load(codeDir: string, codeUri: string | CodeUri): Promise<JSZip> {
        const zip = new JSZip();
        if (typeof codeUri === 'string') {
            codeUri = { value: codeUri };
        }
        codeDir = getCodeRootDir(codeDir, codeUri);
        await this.doLoad(codeDir, zip, codeUri);
        return zip;
    }

    protected async doLoad(codeDir: string, zip: JSZip, codeUri?: CodeUri) {
        const files = readdirSync(codeDir);
        for (const fileName of files) {
            const fullPath = join(codeDir, fileName);
            if (!codeUri?.include || !this.match(codeUri.include, fullPath)) {
                if (codeUri?.exclude && this.match(codeUri.exclude, fullPath)) {
                    continue;
                }
            }

            const file = statSync(fullPath);
            if (file.isDirectory()) {
                const dir = zip.folder(fileName);
                if (dir) {
                    await this.doLoad(fullPath, dir, codeUri);
                }
            } else {
                zip.file(fileName, readFileSync(fullPath), {
                    unixPermissions: '755'
                });
            }
        }
    }

    protected match(pattern: string | RegExp, fullPath: string) {
        const regx = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        return regx.test(fullPath);
    }

}
