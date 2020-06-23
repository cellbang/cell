import { ReactComponent } from './react-component';
import { ROUTER } from '../app/app-protocol';

export const Router =
    function (component?: any, rebind: boolean = true): (target: any) => any {
        return (t: any) => {
            ReactComponent(ROUTER, component || t, rebind)(t);
        };
    };
