import { readdirSync, statSync, readFileSync, remove } from 'fs-extra';
import * as JSZip from 'jszip';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { CodeLoader, CodeUri } from './code-protocol';
import axios from 'axios';
import { v4 } from 'uuid';
var tar = require('tar-fs')
import { createUnzip } from 'zlib';

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
            if (codeUri.startsWith('http:') || codeUri.startsWith('https:')) {
                await this.doLoadForRemote(codeUri, zip);
                return zip;
            }
            codeUri = { value: codeUri };
        }
        codeDir = getCodeRootDir(codeDir, codeUri);
        await this.doLoadForLocal(codeDir, zip, codeUri);
        return zip;
    }

    protected async doLoadForRemote(url: string, zip: JSZip) {
        const res = await axios.get(url, {
            responseType: 'stream',
            headers: {
                Connection: 'keep-alive',
            }
        });

        const stream = res.data;

        if (url.endsWith('tar.gz')) {
            const _tmpdir = tmpdir();
            const codeDir = join(_tmpdir, v4());
            const tarStream = tar.extract(codeDir);
            stream.pipe(createUnzip()).pipe(tarStream);
            await new Promise<void>((resolve, reject) => 
                tarStream
                    .on('finish', () => {
                        this.doLoadForLocal(codeDir, zip).then(() => {
                            remove(codeDir);
                            resolve();
                        }).catch(reject);
                    })
                    .on('error', (error: any) => {
                        reject(error);
                    })
            );
            return zip;
        }

        await zip.loadAsync(stream);
    }

    protected async doLoadForLocal(codeDir: string, zip: JSZip, codeUri?: CodeUri) {
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
                    await this.doLoadForLocal(fullPath, dir, codeUri);
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
