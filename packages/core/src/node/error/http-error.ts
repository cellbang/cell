import { CustomError } from 'ts-custom-error';

export class HttpError extends CustomError {

    constructor(public statusCode: number, message?: string) {
        super(message);
    }

}
