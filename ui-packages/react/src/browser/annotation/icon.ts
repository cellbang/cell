import { ReactComponent } from './react-component';
import { ICON } from '../icon/icon-protocol';
import * as React from 'react';

export const Icon =
    function (component?: React.ComponentType<any>, rebind = false): ClassDecorator {
        return (t: any) => {
            ReactComponent(ICON, component || t, rebind)(t);
        };
    };
