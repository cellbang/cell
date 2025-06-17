import { ErrorUtil } from '../utils';

interface ErrorOptions {
    cause?: unknown
}

/**
 * Allows to easily extend a base class to create custom applicative errors.
 *
 * example:
 * ```
 * class HttpError extends CustomError {
 *     public constructor(
 *         public code: number,
 *         message?: string,
 *      cause?: Error,
 *     ) {
 *         super(message, { cause })
 *     }
 * }
 *
 * new HttpError(404, 'Not found')
 * ```
 */
export class CustomError extends Error {
    override name: string;

    constructor(message?: string, options?: ErrorOptions) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        super(message, options);
        // set error name as constructor name, make it not enumerable to keep native Error behavior
        // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new.target#new.target_in_constructors
        Object.defineProperty(this, 'name', {
            value: new.target.name,
            enumerable: false,
            configurable: true,
        });
        // fix the extended error prototype chain
        // because typescript __extends implementation can't
        // see https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        ErrorUtil.fixProto(this, new.target.prototype);
        // try to remove contructor from stack trace
        ErrorUtil.fixStack(this);
    }
}
