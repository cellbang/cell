import * as expressWs from 'express-ws';
import { resolve, basename, dirname } from 'path';
import * as vm from 'vm';

export default (context: any) => {
    const { server, app, configurations, compiler } = context;

    const ws = expressWs(app, server);

    app.ws('/api', (s: any) => {
        const entryPath = getEntryPath(configurations[1]);
        const source = (compiler.outputFileSystem as any).readFileSync(entryPath);
        const wrapper = `(function (exports, require, module, __filename, __dirname, __request) {
            ${source}
        })`;
        const filename = basename(entryPath);
        const compiled = vm.runInThisContext(wrapper, {
            filename,
            lineOffset: 0,
            displayErrors: true
        });
        const exports: any = {};
        const module = { exports };
        compiled(exports, require, module, filename, dirname(filename));
        const { container, Context, WebSocketContext, Dispatcher, ContainerProvider, Application } = module.exports;
        container.then((c: any) => {
            ContainerProvider.set(c);
            c.get(Application).start();
            const dispatcher = c.get(Dispatcher);
            Context.run(() => new WebSocketContext(ws.getWss(), s, dispatcher));
        });
    });

};

function getEntryPath(configuration: any) {
    const { path, filename } = configuration.output as any;
    return resolve(path, filename);
}
