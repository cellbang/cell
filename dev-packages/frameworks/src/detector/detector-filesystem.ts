import { DetectorFilesystem } from './detector-protocol';
import { existsSync, statSync, readFile } from 'fs-extra';

export abstract class AbstractDetectorFilesystem implements DetectorFilesystem {
    protected abstract doHasPath(name: string): Promise<boolean>;
    protected abstract doReadFile(name: string): Promise<Buffer>;
    protected abstract doIsFile(name: string): Promise<boolean>;

    private pathCache: Map<string, Promise<boolean>>;
    private fileCache: Map<string, Promise<boolean>>;
    private readFileCache: Map<string, Promise<Buffer>>;

    constructor() {
        this.pathCache = new Map();
        this.fileCache = new Map();
        this.readFileCache = new Map();
    }

    public hasPath = async (path: string): Promise<boolean> => {
        let p = this.pathCache.get(path);
        if (!p) {
            p = this.doHasPath(path);
            this.pathCache.set(path, p);
        }
        return p;
    };

    public isFile = async (name: string): Promise<boolean> => {
        let p = this.fileCache.get(name);
        if (!p) {
            p = this.doIsFile(name);
            this.fileCache.set(name, p);
        }
        return p;
    };

    public readFile = async (name: string): Promise<Buffer> => {
        let p = this.readFileCache.get(name);
        if (!p) {
            p = this.doReadFile(name);
            this.readFileCache.set(name, p);
        }
        return p;
    };
}

export class DiskDetectorFilesystem extends AbstractDetectorFilesystem {
    protected async doHasPath(name: string): Promise<boolean> {
        return existsSync(name);
    }
    protected doReadFile(name: string): Promise<Buffer> {
        return readFile(name);
    }
    protected async doIsFile(name: string): Promise<boolean> {
        const stat = statSync(name);
        if (stat.isFile()) {
            return true;
        }
        return false;
    }

}
