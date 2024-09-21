import { Component, Autowired, Prioritizeable } from '@celljs/core';
import { RouteMetadataProvider, RouteMetadata, RouteMetadataConverterProvider, ROUTE_METADATA } from './router-protocol';

@Component(RouteMetadataProvider)
export class RouteMetadataProviderImpl implements RouteMetadataProvider {

    protected prioritized: RouteMetadata[];

    @Autowired(ROUTE_METADATA)
    protected readonly routeMetadatas: RouteMetadata[];

    @Autowired(RouteMetadataConverterProvider)
    protected readonly routeMetadataConverterProvider: RouteMetadataConverterProvider;

    provide(): RouteMetadata[] {
        if (!this.prioritized) {
            this.prioritized = this.parseRouteMetadatas();
        }
        return this.prioritized;
    }

    protected parseRouteMetadatas(): RouteMetadata[] {
        const list: RouteMetadata[] = [];
        for (const routeMetadata of this.routeMetadatas) {
            let parsed = routeMetadata;
            for (const converter of this.routeMetadataConverterProvider.provide()) {
                parsed = converter.convert(parsed);
            }
            list.push(parsed);
        }

        return this.sort(list);

    }

    protected sort(list: RouteMetadata[]) {
        return Prioritizeable.prioritizeAllSync(list).map(c => c.value);
    }
}
