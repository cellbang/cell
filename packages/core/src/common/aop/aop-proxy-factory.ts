import { isResolveMode } from '../utils';
import { ContainerProvider } from '../container';
import { AfterReturningAdvice, AfterThrowsAdvice, AopProxy, AopProxyFactory, AOP_TAG, MethodBeforeAdvice, ProxyConfig } from './aop-protocol';
import { Component } from '../annotation';
import { interfaces } from 'inversify';

@Component({ id: AopProxyFactory, proxy: false })
export class AopProxyFactoryImpl implements AopProxyFactory {

    protected getAdvices<T>(id: interfaces.ServiceIdentifier<T>, tagValues: string[]) {
        const container = ContainerProvider.provide();
        const advices: T[] = [];
        for (const tagValue of tagValues) {
            if (container.isBoundTagged(id, AOP_TAG, tagValue)) {
                advices.push(...container.getAllTagged<T>(id, AOP_TAG, tagValue));
            }
        }
        return advices;
    }

    create(config: ProxyConfig): AopProxy {
        const { metadata: { sysTags } } = config;
        const proxy = new Proxy(config.target, {
            get: (target, method, receiver) => {
                if (isResolveMode()) {
                    return target;
                }
                const func = target[method];
                if (typeof func === 'function') {
                    return async (...args: any[]) => {
                        try {
                            const beforeAdvices = this.getAdvices<MethodBeforeAdvice>(MethodBeforeAdvice, sysTags!);
                            for (const advice of beforeAdvices) {
                                await advice.before(method, args, target);
                            }
                            const returnValue = await func.apply(target, args);
                            const afterReturningAdvices = this.getAdvices<AfterReturningAdvice>(AfterReturningAdvice, sysTags!);
                            for (const advice of afterReturningAdvices) {
                                await advice.afterReturning(returnValue, method, args, target);
                            }
                            return returnValue;
                        } catch (error) {
                            const afterThrowsAdvices = this.getAdvices<AfterThrowsAdvice>(AfterThrowsAdvice, sysTags!);
                            for (const advice of afterThrowsAdvices) {
                                await advice.afterThrows(error, method, args, target);
                            }
                            throw error;
                        }
                    };
                }
                return func;
            }
        });
        return {
            getPorxy() {
                return proxy;
            }
        };
    }

}
