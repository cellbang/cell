import { applyValueDecorator, ElOrValueOption, parseValueOption } from '../value';

export const Value = function (elOrOption?: ElOrValueOption): PropertyDecorator & ParameterDecorator {
    return (target: any, targetKey: string, index?: number) => {
        const option = parseValueOption(target, targetKey, index, elOrOption);
        option.detached = true;
        applyValueDecorator(option, target, targetKey, index);
    };
};
