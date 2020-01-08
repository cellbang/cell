import { Component, Autowired, Prioritizeable, Value, Optional } from '@malagu/core';
import { RouteMetadataConverterProvider, RouteMetadataConverter } from './app-protocol';

@Component(RouteMetadataConverterProvider)
export class RouteMetadataConverterProviderImpl implements RouteMetadataConverterProvider {

    protected prioritized: RouteMetadataConverter[];

    @Autowired(RouteMetadataConverter) @Optional()
    protected readonly routeMetadataConverters: RouteMetadataConverter[] = [];

    @Value('malagu.react.routes')
    protected readonly routes: any = {};

    async provide(): Promise<RouteMetadataConverter[]> {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.routeMetadataConverters).map(c => c.value);
        }
        return this.prioritized;
    }

}
