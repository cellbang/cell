import { AfterReturningAdvice, AopProxyFactory, isResolveMode, MethodBeforeAdvice } from '@malagu/core';
import { ContainerProvider } from '@malagu/core';
import { AopProxy, AOP_TAG, ProxyConfig } from './aop-protocol';
import { Component } from '@malagu/core';
import { interfaces } from 'inversify';
import { AfterThrowsAdvice } from './aop-protocol';

@Component({ id: AopProxyFactory, rebind: true })
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
                            console.log('-----------------------------------');
                            
                            const afterThrowsAdvices = this.getAdvices<AfterThrowsAdvice>(AfterThrowsAdvice, sysTags!);
                            let returnValue = { code: 1, message: 'System Error', type: 'error',  }
                            for (const advice of afterThrowsAdvices) {
                                await advice.afterThrows(returnValue, error, method, args, target);
                            }
                            return returnValue;
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
