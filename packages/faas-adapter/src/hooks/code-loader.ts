import { DeployContext, getHomePath } from '@malagu/cli';
import { CodeLoader, CodeUri, FaaSAdapterConfiguration } from './faas-protocol';
import { readdirSync, statSync, readFileSync, existsSync } from 'fs-extra';
import * as JSZip from 'jszip';
import { join, resolve } from 'path';
const chalk = require('chalk');

export class DefaultCodeLoader implements CodeLoader {
    async load(ctx: DeployContext, config: FaaSAdapterConfiguration): Promise<JSZip> {
        const { pkg } = ctx;
        let codeDir = getHomePath(pkg);
        if (!existsSync(codeDir)) {
            console.log(chalk`{yellow Please build app first with "malagu build"}`);
            throw Error('Please build app first with "malagu build"');
        }
        let codeUri = config.function.codeUri;

        const zip = new JSZip();
        if (typeof codeUri === 'string') {
            codeUri = { value: codeUri };
        }
        if (codeUri?.value) {
            codeDir = resolve(codeDir, codeUri.value);
        }
        await this.doLoad(codeDir, zip, codeUri);
        return zip;
    }

    protected async doLoad(codeDir: string, zip: JSZip, codeUri?: CodeUri) {
        const files = readdirSync(codeDir);
        for (const fileName of files) {
            const fullPath = join(codeDir, fileName);
            if (codeUri?.include) {
                const includes = typeof codeUri.include === 'string' ? new RegExp(codeUri.include) : codeUri.include;
                if (!includes.test(fullPath)) {
                    return;
                }
            }
            if (codeUri?.exclude) {
                const exclude = typeof codeUri.exclude === 'string' ? new RegExp(codeUri.exclude) : codeUri.exclude;
                if (exclude.test(fullPath)) {
                    return;
                }
            }
            const file = statSync(fullPath);
            if (file.isDirectory()) {
                const dir = zip.folder(fileName);
                await this.doLoad(fullPath, dir, codeUri);
            } else {
                zip.file(fileName, readFileSync(fullPath), {
                    unixPermissions: '755'
                });
            }
        }
    }

}
