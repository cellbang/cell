import { applyAutowiredDecorator, parseAutowiredOption, IdOrAutowiredOption } from '../autowired';

export const Autowired = function (idOrOption?: IdOrAutowiredOption): PropertyDecorator & ParameterDecorator {
    return (target: any, targetKey: string, index?: number) => {
        const option = parseAutowiredOption(target, targetKey, index, idOrOption);
        option.detached = true;
        applyAutowiredDecorator(option, target, targetKey, index);
    };
};
