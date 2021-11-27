
import { InstallManager, InstallOptions } from './install-manager';

export default async (options: InstallOptions) => {
    try {
        const installManager = new InstallManager(options);
        await installManager.output();
        await installManager.render();
        await installManager.install();
        await installManager.executeHooks();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
