import { ValueDecorator, getValueOption, applyValueDecorator } from '../value';

export const Value = <ValueDecorator>function (target: any, targetKey: string, index?: number) {
    const option = getValueOption(target, targetKey, index);
    option.detached = true;
    if (targetKey === undefined) {
        return (t: any, tk: string, i?: number) => {
            applyValueDecorator(option, t, tk, i);
        };

    } else {
        applyValueDecorator(option, target, targetKey, index);
    }
};
