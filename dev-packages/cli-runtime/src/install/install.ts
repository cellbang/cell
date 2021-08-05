
import * as program from 'commander';
import { InstallManager } from './install-manager';

export interface InstallOptions {
    runtime?: string;
    alias?: string;
}

export default async (options: InstallOptions) => {
    try {
        const installManager = new InstallManager({ ...options, program });
        await installManager.output();
        await installManager.render();
        await installManager.install();
        await installManager.executeHooks();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
