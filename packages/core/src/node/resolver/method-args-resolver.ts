import { MethodArgsResolver } from './resolver-protocol';
import { Context } from '../context';
import { Component } from '../../common/annotation';
import { BodyMetadata, RequestHeaderMetadata, ParamMetadata, QueryMetadata, RequestCookieMetadata, RequestSessionMetadata } from '../annotation';
import { PATH_PARMAS_ATTR } from '../handler';

@Component(MethodArgsResolver)
export class BodyMethodArgsResolver implements MethodArgsResolver {
    readonly priority = 100;
    async resolve(metadata: any, args: any[]): Promise<void> {
        const body: any = Context.getCurrent().request.body;
        const bodyMetadatas = <BodyMetadata[]>metadata.bodyMetadata;
        if (bodyMetadatas && body !== undefined) {
            for (const m of bodyMetadatas) {
                args[m.parameterIndex] = m.name ? body[m.name] : body;
            }
        }
    }
}

@Component(MethodArgsResolver)
export class HeaderMethodArgsResolver implements MethodArgsResolver {
    readonly priority = 200;
    async resolve(metadata: any, args: any[]): Promise<void> {
        const headers: any = Context.getCurrent().request.headers;
        const headerMetadatas = <RequestHeaderMetadata[]>metadata.requestHeaderMetadata;
        if (headerMetadatas && headers !== undefined) {
            for (const m of headerMetadatas) {
                args[m.parameterIndex] = m.name ? headers[m.name] : headers;
            }
        }
    }
}

@Component(MethodArgsResolver)
export class ParamMethodArgsResolver implements MethodArgsResolver {
    readonly priority = 300;

    async resolve(metadata: any, args: any[]): Promise<void> {
        const params: any = Context.getAttr(PATH_PARMAS_ATTR);
        const paramMetadatas = <ParamMetadata[]>metadata.paramMetadata;
        if (paramMetadatas) {
            for (const m of paramMetadatas) {
                args[m.parameterIndex] = m.name ? params[m.name] : params;
            }
        }
    }
}

@Component(MethodArgsResolver)
export class QueryMethodArgsResolver implements MethodArgsResolver {
    readonly priority = 400;
    async resolve(metadata: any, args: any[]): Promise<void> {
        const query: any = Context.getCurrent().request.query;
        const queryMetadatas = <QueryMetadata[]>metadata.queryMetadata;
        if (queryMetadatas && query !== undefined) {
            for (const m of queryMetadatas) {
                args[m.parameterIndex] = m.name ? query[m.name] : query;
            }
        }
    }
}

@Component(MethodArgsResolver)
export class CookieMethodArgsResolver implements MethodArgsResolver {
    readonly priority = 500;
    async resolve(metadata: any, args: any[]): Promise<void> {
        const cookies = Context.getCookies();
        const cookieMetadatas = <RequestCookieMetadata[]>metadata.requestCookieMetadata;
        if (cookieMetadatas && cookies !== undefined) {
            for (const m of cookieMetadatas) {
                args[m.parameterIndex] = m.name ? cookies.get(m.name) : cookies;
            }
        }
    }
}

@Component(MethodArgsResolver)
export class SessionMethodArgsResolver implements MethodArgsResolver {
    readonly priority = 600;
    async resolve(metadata: any, args: any[]): Promise<void> {
        const session = Context.getSession();
        const sessionMetadatas = <RequestSessionMetadata[]>metadata.requestSessionMetadata;
        if (sessionMetadatas && session !== undefined) {
            for (const m of sessionMetadatas) {
                args[m.parameterIndex] = m.name ? session[m.name] : session;
            }
        }
    }
}
