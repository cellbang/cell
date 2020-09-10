import { CustomError } from '@malagu/core';
import { OAuth2Error } from '../endpoint';
import { AuthenticationError } from '@malagu/security';

export class OAuth2AuthorizationError extends CustomError {

    constructor(public oauth2Error: OAuth2Error, error?: Error) {
        super(error ? error.message : oauth2Error.description);
    }

}

export class OAuth2AuthenticationError extends AuthenticationError {

    constructor(public oauth2Error: OAuth2Error, error?: Error) {
        super(error ? error.message : oauth2Error.description);
    }

}
