import { ComponentMetadata } from '../annotation';
import { Newable } from '../utils';

export const AOP_TAG = 'AOP_TAG';

export const MethodBeforeAdvice = Symbol('MethodBeforeAdvice');
export const AfterReturningAdvice = Symbol('AfterReturningAdvice');
export const AfterThrowsAdvice = Symbol('AfterThrowsAdvice');
export const AopProxyFactory = Symbol('AopProxyFactory');
export const ClassFilter = Symbol('ClassFilter');
export const MethodMatcher = Symbol('MethodMatcher');

export interface Advice { }

export interface BeforeAdvice extends Advice { }

export interface AfterAdvice extends Advice { }

export interface MethodBeforeAdvice extends BeforeAdvice {

    before(method: string | number | symbol, args: any[], target: any): Promise<void>;

}

export interface AfterReturningAdvice extends AfterAdvice {

    afterReturning(returnValue: any, method: string | number | symbol, args: any[], target: any): Promise<void>;

}

export interface AfterThrowsAdvice extends AfterAdvice {

    afterThrows(error: any, method: string | number | symbol, args: any[], target: any): Promise<void>;

}

export interface AopProxy {
    getPorxy(): any
}

export interface ProxyConfig {
    target: any;
    metadata: ComponentMetadata;
}

export interface AopProxyFactory {
    create(config: ProxyConfig): AopProxy;
}

export interface ClassFilter {
    matches(clazz: Newable<any>, metadata: ComponentMetadata): boolean;
}

export interface MethodMatcher {
    matches(method: string | number | symbol, clazz: Newable<any>, args: any[]): boolean;
}

