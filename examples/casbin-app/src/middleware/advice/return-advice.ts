import { AfterReturningAdvice, Aspect, Autowired, Value } from "@malagu/core";
import { AOP_POINTCUT } from "@malagu/web";

const pointcut = AOP_POINTCUT;

@Aspect({ id: AfterReturningAdvice, pointcut })
export class CustomAfterAdvice implements AfterReturningAdvice {
    afterReturning(
        returnValue: any,
        method: string | number | symbol,
        args: any[],
        target: any
    ) {
        console.log(
            `${method.toString()} | ReturnValue | ${JSON.stringify(
                returnValue
            )}`
        );
        return returnValue;
    }
}
