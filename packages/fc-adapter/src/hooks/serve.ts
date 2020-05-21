import { ProfileProvider } from './profile-provider';
import { ServeContext } from '@malagu/cli';

export class Deferred<T> {
    resolve: (value?: T) => void;
    reject: (err?: any) => void; // tslint:disable-line

    promise = new Promise<T>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}

export default (context: ServeContext) => {
    const { app, entryContextProvider, pkg } = context;
    let initialized = false;
    let init: any;
    let handler: any;
    let initDeferred = new Deferred<void>();
    const compileDeferred = new Deferred<void>();
    const type = pkg.backendConfig.deployConfig.type;
    context.compiler.hooks.done.tap('FCAdapterServe', () => {
        entryContextProvider().then(obj => {
            init = obj.init;
            handler = obj.handler;
            initialized = false;
            compileDeferred.resolve();
        });
    });
    console.log(`Serve ${type} type for function compute`);
    if (type !== 'http') {
        app.use((req: any, res: any, next: any) => {
            req.rawBody = '';
            req.setEncoding('utf8');
            req.on('data', (chunk: any) => {
                req.rawBody += chunk;
            });
            req.on('end', () => {
                next();
            });
        });
    }
    const doHandler = (req: any, res: any, ctx: any) => {
        if (type === 'http') {
            handler(req, res, ctx);
        } else if (type === 'event') {
            handler(req.rawBody, ctx, getCallback(res, type));
        } else {
            handler(JSON.stringify({
                headers: req.headers,
                body: req.rawBody,
                method: req.method,
                path: req.path
            }), ctx, getCallback(res, type));
        }
    };

    app.all('*', async (req: any, res: any) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        const ctx = {
            credentials: await new ProfileProvider().provide(true)
        };
        await compileDeferred.promise;
        if (!initialized) {
            initDeferred = new Deferred<void>();
            initialized = true;
            await init(ctx, (err: any) => {
                const callback = getCallback(res, type);
                if (err) {
                    callback(err);
                } else {
                    initDeferred.resolve();
                }
            });
        }
        await initDeferred.promise;
        doHandler(req, res, ctx);

    });

};

function getCallback(res: any, type: string) {
    return (e: any, data?: any) => {
        if (e) {
            const output = formatErr(e);
            console.error(output);
            res.statusCode = 417;
            res.end(output);
        } else {
            if (data) {
                if (type === 'api-gateway') {
                    res.set(data.headers);
                    res.send(data.body);
                } else {
                    res.send(data);
                }
            }
        }
    };
}

function formatErr(err: any) {
    let output = {};
    if (err instanceof Error) {
        output = {
            errorMessage: err.message,
            errorType: err.name,
            stackTrace: err.stack ? err.stack.split('\n').slice(1).map(function (line) {
                return line.trim();
            }) : ''
        };
    } else {
        output = {
            errorMessage: err
        };
    }
    return new Buffer(JSON.stringify(output), 'utf8');
}
