import { RouteMetadata } from '../router/router-protocol';
import { Route } from './route';

export function View(pathOrRouteMetadata?: string | RouteMetadata, rebind = false): ClassDecorator {
    return function (target: any) {
        Route(pathOrRouteMetadata, rebind)(target);
    };
}
