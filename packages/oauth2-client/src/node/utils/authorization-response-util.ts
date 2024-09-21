import { Context } from '@celljs/web/lib/node';
import { OAuth2ParameterNames, AuthorizationResponse } from '@celljs/oauth2-core';

export namespace AuthorizationResponseUtil {

    export function isAuthorizationResponse(): boolean {
        return isAuthorizationResponseSuccess() || isAuthorizationResponseError();
    }

    export function isAuthorizationResponseSuccess(): boolean {
        const request = Context.getRequest();
        const query = request.query || {};
        return !!(query[OAuth2ParameterNames.CODE] && query[OAuth2ParameterNames.STATE]);
    }

    export function isAuthorizationResponseError(): boolean {
        const request = Context.getRequest();
        const query = request.query || {};
        return !!(query[OAuth2ParameterNames.ERROR] && query[OAuth2ParameterNames.STATE]);
    }

    export function convert(redirectUri: string) {
        const request = Context.getRequest();
        const query = request.query || {};

        const code = query[OAuth2ParameterNames.CODE];
        const errorCode = query[OAuth2ParameterNames.ERROR];
        const state = query[OAuth2ParameterNames.STATE];

        if (code) {
            return <AuthorizationResponse>{
                code,
                redirectUri,
                state
            };
        } else {
            const errorDescription = query[OAuth2ParameterNames.ERROR_DESCRIPTION];
            const errorUri = query[OAuth2ParameterNames.ERROR_URI];
            return <AuthorizationResponse>{
                redirectUri,
                state,
                error: {
                    description: errorDescription,
                    uri: errorUri,
                    errorCode
                },
            };
        }
    }
}
