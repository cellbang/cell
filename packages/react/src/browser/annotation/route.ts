import { Constant } from '@malagu/core';
import { RouteMetadata } from '../app';
import { ReactComponent } from './react-component';

export function Route(pathOrRouteMetadata?: string | RouteMetadata, rebind: boolean = false) {
    return function (target: any) {
        let routeMetadata: RouteMetadata;
        if (typeof pathOrRouteMetadata === 'string') {
            routeMetadata = { path: pathOrRouteMetadata, priority: 1000 };
        } else {
            routeMetadata = <RouteMetadata>{ priority: 1000, ...pathOrRouteMetadata };
        }
        if (!routeMetadata.component && !routeMetadata.render) {
            routeMetadata.component = target;
        }
        Constant(RouteMetadata, routeMetadata, false)(target);
        ReactComponent('@Route:' + routeMetadata.path, undefined, rebind)(target);
    };
}
