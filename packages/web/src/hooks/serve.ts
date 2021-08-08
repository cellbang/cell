import { ServeContext } from '@malagu/cli-service';
export class Deferred {
    resolve: () => void;
    reject: (err?: any) => void; // tslint:disable-line

    promise = new Promise<void>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}
export default async (context: ServeContext) => {
    const { app, entryContextProvider } = context;
    let doDispatch: (req: any, res: any) => void;
    const compileDeferred = new Deferred();

    context.compiler.hooks.done.tap('WebServe', () => {
        entryContextProvider().then(async (ctx: any) => {
            const { Dispatcher, Context, HttpContext, ContainerProvider, Application, container } = ctx;
            const c = await container;
            ContainerProvider.set(c);
            await c.get(Application).start();
            const dispatcher = c.get(Dispatcher);
            doDispatch = (req: any, res: any) => {
                const httpContext = new HttpContext(req, res);
                Context.run(() => dispatcher.dispatch(httpContext));
            };
            compileDeferred.resolve();
        });
    });

    app.all('*', async (req: any, res: any) => {
        await compileDeferred.promise;
        doDispatch(req, res);
    });

};
