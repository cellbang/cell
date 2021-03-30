
import { ServeManager } from './serve-manager';
import { CliContext } from '@malagu/cli-common';
import { ServiceContextUtils } from '../context';

export interface ServeOptions {
    entry?: string;
    open?: boolean;
    port?: string;
}

export default async (cliContext: CliContext, options: ServeOptions) => {
    try {
        const ctx = await ServiceContextUtils.createConfigurationContext(cliContext, {
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
