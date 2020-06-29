import { ReactComponent } from './react-component';
import { CONTEXT } from '../app/app-protocol';

export const Context =
    function (component?: any, rebind: boolean = false): (target: any) => any {
        return (t: any) => {
            ReactComponent(CONTEXT, component || t, rebind)(t);
        };
    };
