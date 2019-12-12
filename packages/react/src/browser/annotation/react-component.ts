import { ComponentDecorator, Constant } from '@malagu/core';
import { interfaces } from 'inversify';

export const ReactComponent =
    <ComponentDecorator>function (id?: interfaces.ServiceIdentifier<any> | interfaces.ServiceIdentifier<any>[], rebind: boolean = false): (target: any) => any {
        return (t: any) => {
            Constant(id || t, t, rebind)(t);
        };
    };
