import { Aspect } from "@malagu/core";
import { AOP_POINTCUT } from "@malagu/web";
import { AfterThrowsAdvice } from "../../utils/advice-util";

const pointcut = AOP_POINTCUT;

@Aspect({ id: AfterThrowsAdvice, pointcut })
export class CustomAfterThrowsAdvice implements AfterThrowsAdvice {
    afterThrows(
        returnValue: any,
        error: any,
        method: string | number | symbol,
        args: any[],
        target: any
    ): Promise<void> {
        returnValue.message = error.message;
        console.log(`Error | ${method.toString()} | ${error}`);
        return Promise.resolve(undefined);
    }
}
