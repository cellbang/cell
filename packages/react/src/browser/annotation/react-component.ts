import { Constant } from '@malagu/core';
import { interfaces } from 'inversify';
import * as React from 'react';

export const ReactComponent =
    function (id?: interfaces.ServiceIdentifier<any> | interfaces.ServiceIdentifier<any>[], component?: React.ComponentType<any>, rebind: boolean = false): ClassDecorator {
        return (t: any) => {
            Constant(id || t, component || t, rebind)(t);
        };
    };
