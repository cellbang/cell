export abstract class ErrorUtil {
    /**
     * Fix the prototype chain of the error
     *
     * Use Object.setPrototypeOf
     * Support ES6 environments
     *
     * Fallback setting __proto__
     * Support IE11+, see https://docs.microsoft.com/en-us/scripting/javascript/reference/javascript-version-information
     */
    static fixProto(target: Error, prototype: {}) {
        const setPrototypeOf: Function = (Object as any).setPrototypeOf;
        if (setPrototypeOf) {
            setPrototypeOf(target, prototype);
        } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            target.__proto__ = prototype;
        }
    }

    /**
     * Capture and fix the error stack when available
     *
     * Use Error.captureStackTrace
     * Support v8 environments
     */
    static fixStack(target: Error, fn: Function = target.constructor) {
        const captureStackTrace: Function = (Error as any).captureStackTrace;
        if (captureStackTrace) {
            captureStackTrace(target, fn);
        }
    }
}
