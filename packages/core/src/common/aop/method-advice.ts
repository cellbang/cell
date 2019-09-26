import { Component } from '../annotation';
import { MethodBeforeAdvice, AfterReturningAdvice, AfterThrowsAdvice } from './aop-protocol';

@Component(MethodBeforeAdvice)
export class NoOpMethodBeforeAdivice implements MethodBeforeAdvice {

    async before(method: string | number | symbol, args: any[], target: any): Promise<void> { }
}

@Component(AfterReturningAdvice)
export class NoOpAfterReturningAdvice implements AfterReturningAdvice {

    async afterReturning(returnValue: any, method: string | number | symbol, args: any[], target: any): Promise<void> { }
}

@Component(AfterThrowsAdvice)
export class NoOpAfterThrowsAdvice implements AfterThrowsAdvice {

    async afterThrows(error: any, method: string | number | symbol, args: any[], target: any): Promise<void> { }
}
