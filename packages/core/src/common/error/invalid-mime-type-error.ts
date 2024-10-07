import { CustomError } from './custom-error';

export class InvalidMimeTypeError extends CustomError {
    constructor(public readonly mimeType: string, message: string) {
        super(`Invalid mime type "${mimeType}": ${message}`);
    }
}
