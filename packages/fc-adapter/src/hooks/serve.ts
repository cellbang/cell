import { ProfileProvider } from './profile-provider';

export class Deferred<T> {
    resolve: (value?: T) => void;
    reject: (err?: any) => void; // tslint:disable-line

    promise = new Promise<T>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}

export default (context: any) => {
    const { app, entryContextProvider, pkg } = context;
    let initialized = false;
    let funcHandler: any;
    let deferred = new Deferred<void>();
    const type = pkg.backendConfig.deployConfig.type;
    console.log(`Serve ${type} type for function compute.`);
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
            funcHandler(req, res, ctx);
        } else if (type === 'event') {
            funcHandler(req.rawBody, ctx, getCallback(res, type));
        } else {
            funcHandler(JSON.stringify({
                headers: req.headers,
                body: req.rawBody
            }), ctx, getCallback(res, type));
        }
    };

    app.all('*', async (req: any, res: any) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        const ctx = {
            credentials: new ProfileProvider().provide(true)
        };
        if (!initialized) {
            initialized = true;
            deferred = new Deferred<void>();
            const { init, handler } = entryContextProvider();

            funcHandler = handler;
            await init(ctx, (err: any) => {
                const callback = getCallback(res, type);
                if (err) {
                    callback(err);
                } else {
                    deferred.resolve();
                }
            });
            context.compiler.hooks.done.tap('FCAdapterServe', () => initialized = false);

        }
        await deferred.promise;
        doHandler(req, res, context);

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
