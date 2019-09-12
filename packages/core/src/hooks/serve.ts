import * as expressWs from 'express-ws';

export default (context: any) => {
    const { server, app, entryContextProvider, pkg } = context;

    const ws = expressWs(app, server);
    app.ws(pkg.backendConfig.rpcPath, (s: any) => {
        const { Dispatcher, Context, WebSocketContext, ContainerProvider, Application, container } = entryContextProvider();
        container.then((c: any) => {
            ContainerProvider.set(c);
            c.get(Application).start();
            const dispatcher = c.get(Dispatcher);
            Context.run(() => new WebSocketContext(ws.getWss(), s, dispatcher));
        });
    });

};
