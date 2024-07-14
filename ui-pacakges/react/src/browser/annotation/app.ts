import * as React from 'react';
import { ReactComponent } from './react-component';
import { APP } from '../app/app-protocol';

export const App =
    function (component?: React.ComponentType<any>, rebind: boolean = true): ClassDecorator {
        return (t: any) => {
            ReactComponent(APP, component || t, rebind)(t);
        };
    };
