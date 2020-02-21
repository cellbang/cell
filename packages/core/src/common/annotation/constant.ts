import { interfaces } from 'inversify';
import { METADATA_KEY } from '../constants';

export interface ConstantOption {
    id?: interfaces.ServiceIdentifier<any> | interfaces.ServiceIdentifier<any>[];
    rebind?: boolean;
    constantValue?: boolean;
}

export interface ConstantDecorator {
    (id: interfaces.ServiceIdentifier<any> | interfaces.ServiceIdentifier<any>[], constantValue: any, rebind?: boolean): (target: any) => any;
}

export const Constant =
    <ConstantDecorator>function (id: interfaces.ServiceIdentifier<any> | interfaces.ServiceIdentifier<any>[], constantValue: any, rebind: boolean = false): (target: any) => any {
        return (t: any) => {
            applyConstantDecorator({ id, constantValue, rebind }, t);
        };
    };

export function applyConstantDecorator(option: ConstantOption, target: any): void {
    const previousMetadata = Reflect.getMetadata(METADATA_KEY.constantValue, Reflect) || [];
    const newMetadata = [option].concat(previousMetadata);
    Reflect.defineMetadata(METADATA_KEY.constantValue, newMetadata, Reflect);
}
