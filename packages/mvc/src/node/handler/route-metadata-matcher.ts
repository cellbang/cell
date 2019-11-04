import { Component, Autowired } from '@malagu/core';
import { RouteProvider, RouteMetadata, RouteMetadataMatcher } from './handler-protocol';
import { Context, RequestMatcher } from '@malagu/web/lib/node';

export const PATH_PARMAS_ATTR = 'pathParams';

@Component(RouteMetadataMatcher)
export class RouteMetadataMatcherImpl implements RouteMetadataMatcher {

    @Autowired(RouteProvider)
    protected readonly routeProvider: RouteProvider;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    async match(error?: Error): Promise<RouteMetadata | undefined> {
        const route = await this.routeProvider.provide();
        if (error) {
            const metadata = route.errorMapping.get(error.constructor);
            if (metadata) {
                return metadata;
            } else {
                for (const entry of route.errorMapping) {
                    if (error instanceof <any>entry[0]) {
                        return entry[1];
                    }
                }
            }
        } else {
            const request = Context.getRequest();
            const pathMap = route.mapping.get(request.method!.toLowerCase());
            if (pathMap) {
                for (const entry of pathMap) {
                    const [ p, metadata ] = entry;
                    const pathParams = await this.requestMatcher.match(p);
                    if (pathParams) {
                        Context.setAttr(PATH_PARMAS_ATTR, pathParams);
                        return metadata;
                    }
                }
            }
        }
    }

}
