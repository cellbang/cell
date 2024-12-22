import { CustomError } from '@celljs/core';

export class AIError extends CustomError {
    constructor(message: string) {
        super(message);
    }
} 