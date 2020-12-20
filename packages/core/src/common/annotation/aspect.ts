import { AOP_TAG } from '../aop/aop-protocol';
import { ComponentOption, applyComponentDecorator, COMPONENT_TAG, ComponentId, parseComponentOption } from './component';

export interface AspectOption extends ComponentOption {
    id: ComponentId;
    pointcut?: string;
}

export type AdviceOrAspectOption = ComponentId | AspectOption;

export const Aspect = (adviceOrAspectOption: AdviceOrAspectOption): ClassDecorator => (target: any) => {
    const option = <AspectOption>parseComponentOption(target, adviceOrAspectOption);
    option.pointcut = option.pointcut || COMPONENT_TAG;
    option.tag = { tag: AOP_TAG, value: option.pointcut };
    applyComponentDecorator({ proxy: false, ...option }, target);
};

