import { CustomError } from '@celljs/core';

export class HealthNotFoundError extends CustomError {
    constructor(public indicatorName: string, message: string) {
        super(message);
    }
}
