import { ReactComponent } from '@celljs/react';
import { TOP_AREA } from '../area/area-protocol';

export const TopArea =
    function (component?: any, rebind = true): (target: any) => any {
        return (t: any) => {
            ReactComponent(TOP_AREA, component || t, rebind)(t);
        };
    };
