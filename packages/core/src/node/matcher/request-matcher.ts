import { RequestMatcher } from './matcher-protocol';
import { Context } from '../context';
import { Component } from '../../common';
import * as UrlPattern from 'url-pattern';

@Component(RequestMatcher)
export class RequestMatcherImpl implements RequestMatcher {
    protected caches: Map<string, UrlPattern> = new Map<string, UrlPattern>();

    async match(pattern: any, method?: string): Promise<any> {
        const request = Context.getRequest();
        const path = request.path;
        if (method && request.method && method.toLowerCase() !== request.method.toLowerCase()) {
            return false;
        }
        let urlPathern: UrlPattern | undefined;
        if (typeof pattern === 'string') {
            urlPathern = this.caches.get(pattern);
            if (!urlPathern) {
                urlPathern = new UrlPattern(pattern);
                this.caches.set(pattern, urlPathern);
            }
        } else {
            urlPathern = new UrlPattern(pattern);
        }
        return urlPathern.match(path);
    }

}
