import { existsSync, statSync } from 'fs';
export function awaitEntry(entry: string, startCompileTime: number, tries = 150, interval = 500) {

    return new Promise<void>((resolve, reject) => {
        const attempt = async (count: number) => {
            try {
                if (existsSync(entry) && statSync(entry).mtimeMs > startCompileTime) {
                    resolve();
                } else if (count > 1) {
                    setTimeout(attempt, interval, count - 1);
                } else {
                    reject(new Error('Entry does not exist'));
                }
            } catch (error) {
                reject(error);
            }
        };
        attempt(tries).catch(reject);
    });
}
