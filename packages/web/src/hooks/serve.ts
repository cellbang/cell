import { ServeContext } from '@celljs/cli-service';
export class Deferred {
    resolve: () => void;
    reject: (err?: any) => void; // tslint:disable-line

    promise = new Promise<void>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}

let application: any;
let doDispatch: (req: any, res: any) => void;
export async function after(context: ServeContext) {
    const { app, entryContextProvider, stats } = context;

    if (!entryContextProvider || !stats) {
        return;
    }
    const compileDeferred = new Deferred();
    application?.stop();
    entryContextProvider().then(async (ctx: any) => {
        try {
            const { Dispatcher, Context, ContainerProvider, Application, container, ServerAware } = ctx;
            const c = await container;
            ContainerProvider.set(c);
            application = await c.get(Application);
            await application.start();
            const dispatcher = c.get(Dispatcher);
            doDispatch = (req: any, res: any) => {
                const httpContext = new Context(req, res);
                Context.run(() => dispatcher.dispatch(httpContext));
            };
            const items = c.getAll(ServerAware);
            for (const serverAware of items) {
                await serverAware.setServer(context.server);
            }
            compileDeferred.resolve();
        } catch (err) {
            console.error(err);
        }
    });
    app.all('*', async (req: any, res: any) => {
        try {
            await compileDeferred.promise;
        } catch (err) {
            res.status(500).send(err);
        }
        doDispatch(req, res);
    });

};
