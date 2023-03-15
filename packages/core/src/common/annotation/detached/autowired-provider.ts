import { ContainerUtil } from '../../container/container-util';
import { applyAutowiredDecorator, DoGetValue, IdOrAutowiredOptionWithoutMulti, parseAutowiredOption } from '../autowired';
import { PROVIDER, ID_KEY, doInjectForAutowiredProvider } from '../autowired-provider';

export const AutowiredProvider = function (idOrOption?: IdOrAutowiredOptionWithoutMulti): PropertyDecorator & ParameterDecorator {
    return (target: any, targetKey: string, index?: number) => {
        const option = parseAutowiredOption(target, targetKey, index, idOrOption);
        option.detached = true;
        applyAutowiredDecorator(option, target, targetKey, index, doInjectForAutowiredProvider, doGetValueForAutorpc);
    };
};

const doGetValueForAutorpc: DoGetValue = (option, t, property) => ContainerUtil.getTagged(PROVIDER, ID_KEY, option.id!);
