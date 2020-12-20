import { Newable } from '../utils';
import { ContainerProvider } from '../container';
import { AfterReturningAdvice, AfterThrowsAdvice, AOP_TAG, ClassFilter, MethodBeforeAdvice } from './aop-protocol';
import { Component, ComponentMetadata } from '../annotation';

@Component({ id: ClassFilter, proxy: false })
export class ClassFilterImpl implements ClassFilter {

    matches(clazz: Newable<any>, metadata: ComponentMetadata): boolean {
        const container = ContainerProvider.provide();
        const tagKeys = metadata.sysTags;
        for (const tagValue of tagKeys) {
            if (container.isBoundTagged(MethodBeforeAdvice, AOP_TAG, tagValue)
            || container.isBoundTagged(AfterThrowsAdvice, AOP_TAG, tagValue)
            || container.isBoundTagged(AfterReturningAdvice, AOP_TAG, tagValue)) {
                return true;
            }
        }
        return false;
    }

}
