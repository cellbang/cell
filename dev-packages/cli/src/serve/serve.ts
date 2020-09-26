
import { ServeManager } from './serve-manager';
import { ContextUtils } from '../context';

export interface ServeOptions {
    entry?: string;
    open?: boolean;
    port?: string;
}

export default async (options: ServeOptions) => {
    try {
        const ctx = await ContextUtils.createConfigurationContext(ContextUtils.getCurrent(), {
            dev: true,
            ...options
        });
        if (ctx.configurations.length === 0) {
            throw new Error('No malagu module found.');
        }
        new ServeManager(ctx).start();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }

};
