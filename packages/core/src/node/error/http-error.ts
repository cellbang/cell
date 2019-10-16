import { CustomError } from './cutom-error';

export class HttpError extends CustomError {

    constructor(public statusCode: number, message?: string) {
        super(message);
    }

}
