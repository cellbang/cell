import { Constant } from '@malagu/core';
import { interfaces } from 'inversify';

export const ReactComponent =
    function (id?: interfaces.ServiceIdentifier<any> | interfaces.ServiceIdentifier<any>[], component?: any, rebind: boolean = false): (target: any) => any {
        return (t: any) => {
            Constant(id || t, component || t, rebind)(t);
        };
    };
