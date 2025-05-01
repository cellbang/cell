import { ReactComponent } from './react-component';
import { DEFAULT_LAYOUT } from '../layout/layout-protocol';
import * as React from 'react';

export const DefaultLayout =
    function (component?: React.ComponentType<any>, rebind = true): ClassDecorator {
        return (t: any) => {
            ReactComponent(DEFAULT_LAYOUT, component || t, rebind)(t);
        };
    };
