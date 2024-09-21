import { CustomError } from '@celljs/core';

export class PublicKeyNotFoundError extends CustomError {
    constructor() {
        super('Public key not found');
    }
}

export class PrivateKeyNotFoundError extends CustomError {
    constructor() {
        super('Private key not found');
    }
}
