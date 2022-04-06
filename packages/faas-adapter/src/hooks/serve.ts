import { ServeContext } from '@malagu/cli-service';
import { ConfigUtil } from '@malagu/cli-common/lib/utils/config-util';
export class Deferred {
    resolve: () => void;
    reject: (err?: any) => void; // tslint:disable-line

    promise = new Promise<void>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}
export async function after(context: ServeContext) {
    const { app, entryContextProvider, cfg } = context;

    if (!entryContextProvider) {
        return;
    }
    const mode = ConfigUtil.getBackendConfig(cfg).mode || [];
    if (!mode.includes('event')) {
        return;
    }
    let handler: (event: any, context: any, callback: any) => Promise<void>;
    const compileDeferred = new Deferred();

    context.compiler.hooks.done.tap('WebServe', () => {
        entryContextProvider().then(async (ctx: any) => {
            handler = ctx.handler;
            console.log('Access any route to trigger event function execution.');
            compileDeferred.resolve();
        });
    });

    app.all('*', async (req: any, res: any) => {
        await compileDeferred.promise;
        const event = req.query['event'] || '{}';
        try {
            await handler(event, {}, () => {});
            res.end('Event function executed successfully.');
        } catch (error) {
            res.end('Event function failed to execute.');
            throw error;
        }

    });

};
