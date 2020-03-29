import { HookContext, BACKEND_TARGET } from '@malagu/cli';

export default async (context: HookContext) => {
    const { configurations, dev } = context;

    if (dev !== true) {
        const c = HookContext.getConfiguration(BACKEND_TARGET, configurations);
        if (c) {
            c.devtool = 'inline-source-map';
        }
    }
};
