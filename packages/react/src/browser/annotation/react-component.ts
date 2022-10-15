import { Constant, ComponentId } from '@malagu/core';
import * as React from 'react';

export const ReactComponent =
    function (id?: ComponentId | ComponentId[], component?: React.ComponentType<any>, rebind: boolean = false): ClassDecorator {
        return (t: any) => {
            Constant(id || t, component || t, rebind)(t);
        };
    };
