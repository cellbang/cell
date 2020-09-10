import { HttpError } from './http-error';
import { HttpStatus } from '../../common/http';

export class NotFoundError extends HttpError {

    constructor(message?: string) {
        super(HttpStatus.NOT_FOUND, message);
    }

}

export class NotFoundAndContinueError extends NotFoundError {

}
