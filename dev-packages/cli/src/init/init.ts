
import * as program from 'commander';
import { InitManager } from './init-manager';

export interface InitOptions {
    name?: string;
    template?: boolean;
    outputDir: string;
}

export default async (options: InitOptions) => {
    try {
        const initManager = new InitManager({ ...options, program });
        await initManager.output();
        await initManager.render();
        await initManager.install();
        await initManager.executeHooks();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
