
import { ContextUtils } from '../context';
import { BuildManager } from './build-manager';

export interface BuildOptions {
    entry?: string;
}

export default async (options: BuildOptions) => {
    try {
        const ctx = await ContextUtils.createBuildContext(ContextUtils.getCurrent(), {
            dev: false,
            ...options
        });
        await new BuildManager(ctx).build();
    } catch (error) {
        console.error(error);
        process.exit(-1);
    }
};
