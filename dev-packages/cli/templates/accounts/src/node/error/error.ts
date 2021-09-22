import { CustomError } from '@malagu/core';

export class UserNotFoundError extends CustomError {
    constructor(public userIdOrEmail: number | string) {
        super(`No user found: ${userIdOrEmail}`);
    }
}

export class IdentityNotFoundError extends CustomError {

    constructor(public identity: number, public provider: string) {
        super(`No identity found: ${provider}(${identity})`);
    }
}
