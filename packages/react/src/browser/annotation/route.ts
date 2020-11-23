import { Constant } from '@malagu/core';
import { RouteMetadata, ROUTE_METADATA } from '../router/router-protocol';
import { ReactComponent } from './react-component';

export function Route(pathOrRouteMetadata?: string | RouteMetadata, rebind: boolean = false): ClassDecorator {
    return function (target: any) {
        let routeMetadata: RouteMetadata;
        if (typeof pathOrRouteMetadata === 'string') {
            routeMetadata = { path: pathOrRouteMetadata, priority: 1000, isDefaultLayout: true };
        } else {
            routeMetadata = <RouteMetadata>{ priority: 1000, isDefaultLayout: true, ...pathOrRouteMetadata };
        }
        if (!routeMetadata.component && !routeMetadata.render) {
            routeMetadata.component = target;
        }
        Constant(ROUTE_METADATA, routeMetadata, false)(target);
        ReactComponent('@Route:' + routeMetadata.path, undefined, rebind)(target);
    };
}
