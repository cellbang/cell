import { CustomError } from '@malagu/core';

export class HealthNotFoundError extends CustomError {
    constructor(public indicatorName: string, message: string) {
        super(message);
    }
}
