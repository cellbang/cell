import * as JSZip from 'jszip';

export interface CodeLoader {
    load(codeDir: string, codeUri: string | CodeUri): Promise<JSZip>;
}

export interface Deployer<P, R> {
    deploy(ctx: P): Promise<R>;
}

export interface CodeUri {
    value?: string;
    exclude?: string | RegExp;
    include?: string | RegExp
}

