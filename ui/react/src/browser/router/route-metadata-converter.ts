import { Autowired, Component, Value } from '@malagu/core';
import { DEFAULT_LAYOUT } from '../layout';
import { PathResolver } from '../resolver';
import { RouteMetadata, RouteMetadataConverter } from './router-protocol';

@Component(RouteMetadataConverter)
export class DefaultRouteMetadataConverter implements RouteMetadataConverter {
    readonly priority: number = 500;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Autowired(DEFAULT_LAYOUT)
    protected readonly defaultLayout: React.ComponentType;

    @Value('malagu.react.router.routes')
    protected readonly routes: any;

    convert(metadata: RouteMetadata): RouteMetadata {
        if (metadata.path) {
            metadata.path = this.pathResolver.resolve(metadata.path);
        }
        metadata.layout = metadata.layout || this.defaultLayout;
        return metadata;
    }

    protected getMergedConfig(routeMetadata: RouteMetadata): RouteMetadata {
        if (!this.routes || !routeMetadata.path) {
            return routeMetadata;
        }

        return { ...routeMetadata, ...this.routes[routeMetadata.path] };
    }
}
