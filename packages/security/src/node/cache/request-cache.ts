import { RequestCache, SavedRequest, SAVED_REQUEST } from './cache-protocol';
import { AttributeScope, Context } from '@celljs/web/lib/node';
import { Component, Value, Autowired } from '@celljs/core';
import { ENDPOINT, PathResolver } from '@celljs/web';
import * as qs from 'qs';

@Component(RequestCache)
export class HttpSessionRequestCache implements RequestCache {

    @Value(ENDPOINT)
    protected readonly endpoint: string;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    async save(savedRequest?: SavedRequest): Promise<void> {
        if (Context.getSession()) {
            const request = Context.getRequest();
            Context.setAttr(SAVED_REQUEST, savedRequest || {
                redirectUrl: await this.pathResolver.resolve(this.endpoint, request.path, qs.stringify(request.query)),
                method: request.method.toUpperCase(),
                query: { ...request.query }
            }, AttributeScope.Session);
        }
    }
    async get(): Promise<SavedRequest | undefined> {
        if (Context.getSession()) {
            return Context.getAttr<SavedRequest>(SAVED_REQUEST, AttributeScope.Session);
        }
    }

    async remove(): Promise<void> {
        if (Context.getSession()) {
            Context.setAttr(SAVED_REQUEST, undefined, AttributeScope.Session);
        }
    }

}
