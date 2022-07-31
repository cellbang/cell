import axios from 'axios';
export function awaitUrl(url: string, tries = 150, interval = 1000) {

    return new Promise<void>((resolve, reject) => {
        const attempt = async (count: number) => {
            try {
                await axios.head(url, {
                    timeout: 10000
                });
                resolve();
            } catch (error) {
                if (error.code !== 'ECONNREFUSED') {
                    resolve();
                } else if (count > 1) {
                    setTimeout(attempt, interval, count - 1);
                } else {
                    reject(error);
                }
            }
        };
        attempt(tries).catch(reject);
    });
};
