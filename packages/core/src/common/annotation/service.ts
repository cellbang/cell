import { ComponentDecorator, ComponentOption, parseComponentOption, applyComponentDecorator } from './component';

export const SERVICE_TAG = 'Service';

export const Service = <ComponentDecorator>function (...idOrOption: any): ClassDecorator {
    return (t: any) => {
        const option = parseComponentOption(t, idOrOption);
        applyComponentDecorator(option, t);
    };
};

export function applyServiceDecorator(option: ComponentOption, target: any) {
    option.sysTags = option.sysTags?.indexOf(SERVICE_TAG) ? option.sysTags :  [SERVICE_TAG, ...(option.sysTags || [])];
    return applyComponentDecorator(option, target);
}
