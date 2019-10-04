import * as requestContext from 'express-http-context';
import { WebSocketChannel, Channel } from '../common';
import ws = require('ws');
import { Dispatcher } from './dispatcher';
import { Session } from './session/session-protocol';
import { Cookies } from './cookies';
import { Request, Response } from './http/http-protocol';
import { WebSocketChannelStrategy, ChannelStrategy, HttpChannelStrategy, CheckAliveWS } from './channel';

export enum AttributeScope { App, Request, Session }

export const CURRENT_CONTEXT_REQUEST_KEY = 'CurrentContextRequest';
export const CURRENT_COOKIES_REQUEST_KEY = 'CurrentCookiesRequest';
export const CURRENT_SESSION_REQUEST_KEY = 'CurrentSessionRequest';
export const CURRENT_CHANNEL_STRATEGY_REQUEST_KEY = 'CurrentChannelStrategyRequest';

const appAttrs = new Map<string, any>();

export interface Context {

    readonly request: Request;

    readonly response: Response;

    channelStrategy?: ChannelStrategy;
}

export namespace Context {

    export function run(fn: (...args: any[]) => void) {
        requestContext.ns.run(fn);
    }

    export function setCurrent(context: Context) {
        requestContext.set(CURRENT_CONTEXT_REQUEST_KEY, context);
    }

    export function getCurrent<T extends Context>(): T {
        return requestContext.get(CURRENT_CONTEXT_REQUEST_KEY);
    }

    export function getRequest(): Request {
        return getCurrent().request;
    }

    export function getResponse(): Response {
        return getCurrent().response;
    }

    export function getCookies(): Cookies {
        return requestContext.get(CURRENT_COOKIES_REQUEST_KEY);
    }

    export function setCookies(cookies: Cookies): void {
        requestContext.set(CURRENT_COOKIES_REQUEST_KEY, cookies);
    }

    export function getSession(): Session {
        return requestContext.get(CURRENT_SESSION_REQUEST_KEY);
    }

    export function setSession(session: Session): void {
        requestContext.set(CURRENT_SESSION_REQUEST_KEY, session);
    }

    export function getChannalStrategy(): ChannelStrategy {
        return requestContext.get(CURRENT_CHANNEL_STRATEGY_REQUEST_KEY);
    }

    export function setChannalStrategy(channelStrategy: ChannelStrategy): void {
        requestContext.set(CURRENT_CHANNEL_STRATEGY_REQUEST_KEY, channelStrategy);
    }

    export function setAttr(key: string, value: any, scope: AttributeScope = AttributeScope.Request) {
        if (scope === AttributeScope.Request) {
            requestContext.set(key, value);
        } else if (scope === AttributeScope.Session) {
            getSession()[key] = value;
        } else {
            appAttrs.set(key, value);
        }
    }

    export function getAttr<T>(key: string, scope?: AttributeScope): T {
        if (scope) {
            if (scope === AttributeScope.Request) {
                return requestContext.get(key);
            } else if (scope === AttributeScope.Session) {
                return getSession()[key];
            } else {
                return appAttrs.get(key);
            }
        } else {
            let value = requestContext.get(key);
            value = value ? value : getSession()[key];
            return value ? value : appAttrs.get(key);
        }
    }

}

export class HttpContext implements Context {

    readonly channelStrategy = new HttpChannelStrategy();

    constructor(public request: Request, public response: Response) {
    }
}

export class WebSocketContext extends HttpContext {

    protected message: Channel.Message;
    protected socket: CheckAliveWS;
    protected checkAliveTimeout = 30000;
    protected channels = new Map<number, WebSocketChannel>();
    channelStrategy: ChannelStrategy;

    constructor(request: Request, response: Response, protected readonly server: ws.Server, socket: ws, protected dispatcher: Dispatcher<WebSocketContext>) {
        super(request, response);
        this.socket = <CheckAliveWS>socket;
        this.socket.alive = true;
        this.channelStrategy = new WebSocketChannelStrategy(this.socket, this.channels);
        socket.on('pong', () => this.socket.alive = true);
        setInterval(() => {
            server.clients.forEach((s: CheckAliveWS) => {
                if (s.alive === false) {
                    s.terminate();
                    return;
                }
                s.alive = false;
                s.ping();
            });
        }, this.checkAliveTimeout);

        this.socket.on('message', data => {
            this.message = JSON.parse(data.toString());
            Context.run(() => this.dispatcher.dispatch(this));
        });
        this.socket.on('error', err => {
            for (const channel of this.channels.values()) {
                channel.fireError(err);
            }
        });
        this.socket.on('close', (code, reason) => {
            for (const channel of [...this.channels.values()]) {
                channel.close(code, reason);
            }
            this.channels.clear();
        });
    }
}
