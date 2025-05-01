import { Constant, ComponentId } from '@celljs/core';
import * as React from 'react';

export const ReactComponent =
    function (id?: ComponentId | ComponentId[], component?: React.ComponentType<any>, rebind = false): ClassDecorator {
        return (t: any) => {
            Constant(id || t, component || t, rebind)(t);
        };
    };
