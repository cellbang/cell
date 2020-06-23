import { ReactComponent } from './react-component';
import { APP } from '../app/app-protocol';

export const App =
    function (component?: any, rebind: boolean = true): (target: any) => any {
        return (t: any) => {
            ReactComponent(APP, component || t, rebind)(t);
        };
    };
