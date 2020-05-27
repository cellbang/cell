import { HttpContext } from '@malagu/web/lib/node';
import * as http from 'http';

export type Callback = (err: Error | undefined, data: any) => void;

export function parseApiGatewayContext(event: string, context: any, callback: Callback) {
    const e = JSON.parse(event);
    const request = {
        method: e.httpMethod || e.method,
        path: e.path,
        url: e.path,
        connection: {} as any,
        query: e.queryParameters || {},
        headers: e.headers,
        get body() {
            const body = e.isBase64Encoded ? Buffer.from(e.body, 'base64').toString('utf8') : e.body;
            if (e.headers['content-type'] === 'application/json') {
                return JSON.parse(body);
            }
            return body;
        }

    };
    const res: { [key: string]: any } = {
        headers: {},
        statusCode: 200,
        isBase64Encoded: false
    };
    const response = {
        setHeader(name: string, value: number | string | string[]): void {
            res.headers[name] = value;
        },

        getHeader(name: string): number | string | string[] | undefined {
            return this.getHeaders()[name];
        },

        getHeaders(): http.OutgoingHttpHeaders {
            return res.headers;
        },

        get statusCode(): number {
            return res.statusCode || 200;
        },

        finished: false,

        set statusCode(statusCode: number) {
            res.statusCode = statusCode;
        },

        end: (chunk: any, encoding?: string, cb?: Function): void => {
            callback(undefined, {
                ...res,
                body: chunk
            });
        }

    };

    const ctx = new HttpContext(request, response);
    (ctx as any).event = event;
    (ctx as any).context = context;
    (ctx as any).callback = callback;
    return ctx;
}

export function ParseHttpTriggerContext(req: any, res: any, context: any) {
    const request = req;
    if (req.queries) {
        request.query = req.queries;
        request.connection = {} as any;
    }
    if (req.headers['content-type'] === 'application/json') {
        request.body = request.body ? JSON.parse(request.body) : request.body;
    }
    const response = {
        setHeader(name: string, value: number | string | string[]): void {
            res.setHeader(name, value);
        },

        getHeader(name: string): number | string | string[] | undefined {
            return res.getHeader ? res.getHeader(name) : (this.getHeaders()[name] ? this.getHeaders()[name] : res.headersMap[name]);
        },

        getHeaders(): http.OutgoingHttpHeaders {
            return res.headers || res.getHeaders();
        },

        get statusCode(): number {
            return res.statusCode;
        },

        set statusCode(statusCode: number) {
            res.statusCode = statusCode;
        },

        finished: false,

        end(chunk: any, encoding?: string, cb?: Function): void {
            this.finished = true;
            // eslint-disable-next-line no-null/no-null
            res.send(chunk === undefined || chunk === null ? '' : chunk);
        }
    };
    const ctx = new HttpContext(request, response);
    (ctx as any).context = context;
    return ctx;
}
