export const  MethodBeforeAdvice = Symbol('MethodBeforeAdvice');
export const  AfterReturningAdvice = Symbol('AfterReturningAdvice');
export const  AfterThrowsAdvice = Symbol('AfterThrowsAdvice');

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
