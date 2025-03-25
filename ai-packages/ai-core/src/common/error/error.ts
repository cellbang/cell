import { CustomError } from '@celljs/core';

export class AIError extends CustomError {
    constructor(message: string) {
        super(message);
    }
}

export class NotFoundError extends AIError {
    constructor(message: string) {
        super(message);
    }
}
