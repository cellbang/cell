import { ReactComponent } from './react-component';
import { interfaces } from 'inversify';
import { CONTEXT } from '../app/app-protocol';

export const Context =
    function (id?: interfaces.ServiceIdentifier<any> | interfaces.ServiceIdentifier<any>[], component?: any, rebind: boolean = false): (target: any) => any {
        return (t: any) => {
            ReactComponent(id || CONTEXT, component || t, rebind)(t);
        };
    };
