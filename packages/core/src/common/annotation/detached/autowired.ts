import { AutowiredDecorator, applyAutowiredDecorator, getAutowiredOption } from '../autowired';

export const Autowired = <AutowiredDecorator>function (target: any, targetKey: string, index?: number) {
    const option = getAutowiredOption(target, targetKey, index);
    option.detached = true;
    if (targetKey === undefined) {
        return (t: any, tk: string, i?: number) => {
            applyAutowiredDecorator(option, t, tk, i);
        };

    } else {
        applyAutowiredDecorator(option, target, targetKey, index);
    }
};
