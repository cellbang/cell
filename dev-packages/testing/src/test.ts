import { fork } from 'child_process';
import { awaitUrl } from './await-url';

export abstract class Test {

    static async createHttpServer() {
        const malaguMainPath = require.resolve('@malagu/cli/lib/malagu-main');
        const subprocess = fork(malaguMainPath, ['serve', '-p', '0', '-m', 'spec'], { stdio: 'ignore' });
        process.on('exit', () => {
            subprocess.kill('SIGINT');
        });

        process.on('SIGINT', () => {
            subprocess.kill('SIGINT');
        });
        return new Promise<string>(resolve => {
            subprocess.on('message', async (messageEvent: MessageEvent<any>) => {
                const url = `http://127.0.0.1:${messageEvent.data.port}`;
                await awaitUrl(url);

                if (messageEvent.type === 'address') {
                    resolve(url);
                }
            });
        });
    }

}
