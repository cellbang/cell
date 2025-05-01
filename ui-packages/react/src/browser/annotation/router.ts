import { ReactComponent } from './react-component';
import { ROUTER } from '../router/router-protocol';
import * as React from 'react';

export const Router =
    function (component?: React.ComponentType<any>, rebind = true): ClassDecorator {
        return (t: any) => {
            ReactComponent(ROUTER, component || t, rebind)(t);
        };
    };
