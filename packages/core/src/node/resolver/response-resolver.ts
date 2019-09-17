import { ResponseResolver } from './resolver-protocol';
import { Context } from '../context';
import { Component } from '../../common/annotation';
import { ResponseHeaderMetadata, ResponseCookieMetadata, ResponseSessionMetadata } from '../annotation';

@Component(ResponseResolver)
export class HeaderResponseResolver implements ResponseResolver {
    readonly priority = 500;
    async resolve(metadata: any): Promise<void> {
        const response = Context.getCurrent().response;
        const headerMetadatas = <ResponseHeaderMetadata[]>metadata.responseHeaderMetadata;
        if (headerMetadatas) {
            for (const m of headerMetadatas) {
                response.setHeader(m.name, m.value);
            }
        }
    }
}

@Component(ResponseResolver)
export class CookieResponseResolver implements ResponseResolver {
    readonly priority = 500;
    async resolve(metadata: any): Promise<void> {
        const cookies = Context.getCookies();
        const cookieMetadatas = <ResponseCookieMetadata[]>metadata.responseCookieMetadata;
        if (cookieMetadatas && cookies) {
            for (const m of cookieMetadatas) {
                cookies.set(m.name, m.value);
            }
        }
    }
}

@Component(ResponseResolver)
export class SessionResponseResolver implements ResponseResolver {
    readonly priority = 500;
    async resolve(metadata: any): Promise<void> {
        const session = Context.getSession();
        const sessionMetadatas = <ResponseSessionMetadata[]>metadata.responseSessionMetadata;
        if (sessionMetadatas && session) {
            for (const m of sessionMetadatas) {
                session[m.name] = m.value;
            }
        }
    }
}
