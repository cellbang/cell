import { CustomError } from 'ts-custom-error';

export class AuthenticationError extends CustomError {

    constructor(message?: string) {
        super(message);
    }

}

export class AccountStatusError extends AuthenticationError {

}

export class UsernameNotFoundError extends AuthenticationError {

}

export class BadCredentialsError extends AuthenticationError {

}

export class LockedError extends AccountStatusError {

}

export class DisabledError extends AccountStatusError {

}

export class AccountExpiredError extends AccountStatusError {

}

export class CredentialsExpiredError extends AccountStatusError {

}

export class AccessDeniedError extends CustomError {

}
