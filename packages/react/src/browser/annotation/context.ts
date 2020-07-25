import { ReactComponent } from './react-component';
import { CONTEXT } from '../context/context-protocol';
import * as React from 'react';

export const Context =
    function (component?: React.ComponentType<any>, rebind: boolean = false): (target: any) => any {
        return (t: any) => {
            ReactComponent(CONTEXT, component || t, rebind)(t);
        };
    };
