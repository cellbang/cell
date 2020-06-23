import { Constant } from '@malagu/core';
import { ROUTE_METADATA, RedirectMetadata } from '../app/app-protocol';

export function Redirect(toOrRedirectMetadata?: string | RedirectMetadata, rebind: boolean = false) {
    return function (target: any) {
        let redirectMetadata: RedirectMetadata;
        if (typeof toOrRedirectMetadata === 'string') {
            redirectMetadata = { to: toOrRedirectMetadata, priority: 1000, isDefaultLayout: true };
        } else {
            redirectMetadata = <RedirectMetadata>{ priority: 1000, isDefaultLayout: true, ...toOrRedirectMetadata };
        }
        Constant(ROUTE_METADATA, redirectMetadata, rebind)(target);
    };
}
