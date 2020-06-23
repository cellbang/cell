import { ReactComponent } from './react-component';
import { DEFAULT_LAYOUT } from '../app/app-protocol';

export const DefaultLayout =
    function (component?: any, rebind: boolean = true): (target: any) => any {
        return (t: any) => {
            ReactComponent(DEFAULT_LAYOUT, component || t, rebind)(t);
        };
    };
