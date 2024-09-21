import { CustomError } from '@celljs/core';

export class HttpError extends CustomError {

    constructor(public statusCode: number, message?: string) {
        super(message);
    }

}
