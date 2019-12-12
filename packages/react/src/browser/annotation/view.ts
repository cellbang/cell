import { RouteMetadata } from '../app';
import { Route } from './route';

export function View(pathOrRouteMetadata?: string | RouteMetadata, rebind: boolean = false) {
    return function (target: any) {
        Route(pathOrRouteMetadata, rebind)(target);
    };
}
