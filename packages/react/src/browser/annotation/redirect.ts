import { Constant } from '@malagu/core';
import { RouteMetadata, RedirectMetadata } from '../app';

export function Redirect(toOrRedirectMetadata?: string | RedirectMetadata, rebind: boolean = false) {
    return function (target: any) {
        let redirectMetadata: RedirectMetadata;
        if (typeof toOrRedirectMetadata === 'string') {
            redirectMetadata = { to: toOrRedirectMetadata, priority: 1000 };
        } else {
            redirectMetadata = <RedirectMetadata>{ priority: 1000, ...toOrRedirectMetadata };
        }
        Constant(RouteMetadata, redirectMetadata, rebind)(target);
    };
}
