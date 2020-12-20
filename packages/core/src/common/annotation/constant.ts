import { METADATA_KEY } from '../constants';
import { ComponentId } from './component';

export interface ConstantOption {
    id: ComponentId | ComponentId[];
    rebind?: boolean;
    constantValue?: any;
}

export const Constant = function (id: ComponentId | ComponentId[], constantValue: any, rebind = false): ClassDecorator {
        return (t: any) => {
            applyConstantDecorator({ id, constantValue, rebind }, t);
        };
    };

export function applyConstantDecorator(option: ConstantOption, target: any): void {
    const previousMetadata = Reflect.getMetadata(METADATA_KEY.constantValue, Reflect) || [];
    const newMetadata = [option].concat(previousMetadata);
    Reflect.defineMetadata(METADATA_KEY.constantValue, newMetadata, Reflect);
}
