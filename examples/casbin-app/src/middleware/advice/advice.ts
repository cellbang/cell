import { Aspect, MethodBeforeAdvice } from "@malagu/core";
import { AOP_POINTCUT } from "@malagu/web";

const pointcut = AOP_POINTCUT;

@Aspect({ id: MethodBeforeAdvice, pointcut })
export class CustomMethodBeforeAdvice implements MethodBeforeAdvice {
    before(
        method: string | number | symbol,
        args: any[],
        target: any
    ): Promise<void> {
        console.log(
            `${method.toString()} | QueryValue | ${JSON.stringify(args)}`
        );
        return Promise.resolve(undefined);
    }
}
