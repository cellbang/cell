import * as fs from 'fs';

// tslint:disable-next-line:no-any
function readJsonFile(path: string): any {
    return JSON.parse(fs.readFileSync(path, { encoding: 'utf-8' }));
}

export { readJsonFile };
