import { existsSync } from 'fs';
export function awaitEntry(entry: string, tries = 150, interval = 500) {

    return new Promise<void>((resolve, reject) => {
        const attempt = async (count: number) => {
            try {
                if (existsSync(entry)) {
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
};
