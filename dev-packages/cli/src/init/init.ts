import { InitManager, InitOptions } from './init-manager';

export default async (options: InitOptions) => {
    try {
        const initManager = new InitManager(options);
        await initManager.output();
        await initManager.render();
        await initManager.install();
        await initManager.executeHooks();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
