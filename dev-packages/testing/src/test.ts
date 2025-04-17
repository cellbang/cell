import { ChildProcess, fork } from 'child_process';
import { awaitUrl } from './await-url';
import { createRequire } from 'module';
import { awaitEntry } from './await-entry';

export abstract class Test {

    static async createHttpServer() {
        const subprocess = this.runCommand(['serve', '-p', '0', '-m', 'test']);
        const url = await this.waitForServeAddress(subprocess);
        await awaitUrl(url);
        return url;
    }

    static async createContainer<T>(): Promise<T> {
        const subprocess = this.runCommand(['serve', '-m', 'test,ipc']);
        const entry = await this.waitForServeEntry(subprocess);
        await awaitEntry(entry);
        const { container } = createRequire(__filename)(entry);
        return container;
    }

    static runCommand(args: string[]) {
        const cellMainPath = require.resolve('@celljs/cli/lib/cell-main');
        const subprocess = fork(cellMainPath, args, { stdio: 'ignore' });
        process.on('exit', () => {
            subprocess.kill('SIGINT');
        });

        process.on('SIGINT', () => {
            subprocess.kill('SIGINT');
        });
        return subprocess;
    }

    static async waitForServeAddress(subprocess: ChildProcess) {
        return new Promise<string>(resolve => {
            subprocess.on('message', async (messageEvent: MessageEvent<any>) => {
                if (messageEvent.type === 'address') {
                    if (messageEvent.data?.port) {
                        resolve(`http://127.0.0.1:${messageEvent.data.port}`);
                    } else {
                        resolve('');
                    }
                }
            });
        });
    }

    static async waitForServeEntry(subprocess: ChildProcess) {
        return new Promise<string>(resolve => {
            subprocess.on('message', async (messageEvent: MessageEvent<any>) => {
                if (messageEvent.type === 'entry') {
                    resolve(messageEvent.data?.entry);
                }
            });
        });
    }

}
