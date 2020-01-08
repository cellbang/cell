import { Component, Autowired, Prioritizeable, Value } from '@malagu/core';
import { RouteMetadataProvider, RouteMetadata, RouteMetadataConverterProvider, RedirectMetadata } from './app-protocol';

@Component(RouteMetadataProvider)
export class RouteMetadataProviderImpl implements RouteMetadataProvider {

    protected prioritized: (RouteMetadata | RedirectMetadata)[];

    @Autowired(RouteMetadata)
    protected readonly routeMetadatas: (RouteMetadata | RedirectMetadata)[];

    @Autowired(RouteMetadataConverterProvider)
    protected readonly routeMetadataConverterProvider: RouteMetadataConverterProvider;

    @Value('malagu.react.routes')
    protected readonly routes: any;

    async provide(): Promise<(RouteMetadata | RedirectMetadata)[]> {
        if (!this.prioritized) {
            const result = this.routeMetadatas.map(async value => {
                let r = value;
                if (!RedirectMetadata.is(value) && this.routes) {
                    const keys = value.path ? (Array.isArray(value.path) ? [...value.path] : [value.path]) : [];
                    if (value.component && value.component.name) {
                        keys.push(value.component.name);
                    }
                    for (const key of keys) {
                        r = { ...r, ...this.routes[key] };
                    }
                }
                for (const converter of await this.routeMetadataConverterProvider.provide()) {
                    r = await converter.convert(r);
                }
                return r;
            });
            this.prioritized = Prioritizeable.prioritizeAllSync(await Promise.all(result)).map(c => c.value);
        }
        return this.prioritized;
    }

}
