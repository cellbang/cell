import { RequestMatcher } from './matcher-protocol';
import { Context } from '../context';
import { Component, Value } from '@malagu/core';
import * as UrlPattern from 'url-pattern';

@Component(RequestMatcher)
export class RequestMatcherImpl implements RequestMatcher {
    protected caches: Map<string, UrlPattern> = new Map<string, UrlPattern>();

    @Value('malagu.web.route.cacheSize')
    protected readonly cacheSize: number;

    async match(pattern: any, method?: string): Promise<any> {
        const request = Context.getRequest();
        const path = request.path;
        if (method && request.method && method.toUpperCase() !== request.method.toUpperCase()) {
            return false;
        }
        pattern = pattern || '/';
        let urlPattern: UrlPattern | undefined;
        if (typeof pattern === 'string') {
            urlPattern = this.caches.get(pattern);
            if (!urlPattern) {
                urlPattern = new UrlPattern(pattern);
                if (this.caches.size < this.cacheSize) {
                    this.caches.set(pattern, urlPattern);
                }
            }
        } else {
            urlPattern = new UrlPattern(pattern);
        }
        return urlPattern.match(path);
    }

}
