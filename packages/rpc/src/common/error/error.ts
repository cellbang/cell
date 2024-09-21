import { CustomError } from '@celljs/core';

export class EndpointNotFoundError extends CustomError {
    constructor(public serviceId: string) {
        super(`No endpoint found: ${serviceId}`);
    }
}
