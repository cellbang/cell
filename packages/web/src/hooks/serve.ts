import * as express from 'express';
export class Deferred<T> {
    resolve: (value?: T) => void;
    reject: (err?: any) => void; // tslint:disable-line

    promise = new Promise<T>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}
export default async (context: any) => {
    const { app, entryContextProvider } = context;
    app.use(express.json());
    app.use(express.raw());
    app.use(express.text());
    let doDispatch: (req: any, res: any) => void;
    const compileDeferred = new Deferred<void>();

    context.compiler.hooks.done.tap('WebServe', () => {
        entryContextProvider().then(async (ctx: any) => {
            const { Dispatcher, Context, HttpContext, ContainerProvider, Application, container } = ctx;
            const c = await container;
            ContainerProvider.set(c);
            await c.get(Application).start();
            doDispatch = (req: any, res: any) => {
                const dispatcher = c.get(Dispatcher);
                const httpContext = new HttpContext(req, res);
                Context.run(() => dispatcher.dispatch(httpContext));
            };
            compileDeferred.resolve();
        });
    });

    app.all('*', async (req: any, res: any) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        await compileDeferred.promise;
        doDispatch(req, res);
    });

};
