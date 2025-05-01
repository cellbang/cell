import { ReactComponent } from '@celljs/react';
import { LEFT_AREA } from '../area/area-protocol';

export const LeftArea =
    function (component?: any, rebind = true): (target: any) => any {
        return (t: any) => {
            ReactComponent(LEFT_AREA, component || t, rebind)(t);
        };
    };
