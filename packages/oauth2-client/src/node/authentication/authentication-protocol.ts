import { Authentication, DEFAULT_AUTHENTICATION_PROVIDER_PRIORITY } from '@malagu/security';
import { ClientRegistration } from '../registration';
import { AuthorizationExchange, AccessToken, RefreshToken } from '@malagu/oauth2-core';

export const INVALID_ID_TOKEN_ERROR_CODE = 'invalid_id_token';
export const INVALID_NONCE_ERROR_CODE = 'invalid_nonce';
export const AUTHORIZATION_REQUEST_NOT_FOUND_ERROR_CODE = 'authorization_request_not_found';
export const CLIENT_REGISTRATION_NOT_FOUND_ERROR_CODE = 'client_registration_not_found';

export const OAUTH2_AUTHENTICATION_PROVIDER_PRIORITY = DEFAULT_AUTHENTICATION_PROVIDER_PRIORITY + 100;
export const OIDC_AUTHENTICATION_PROVIDER_PRIORITY = OAUTH2_AUTHENTICATION_PROVIDER_PRIORITY + 100;

export interface OAuth2LoginAuthentication extends Authentication {
    clientRegistration: ClientRegistration;
    authorizationExchange: AuthorizationExchange;
    accessToken: AccessToken;
    refreshToken?: RefreshToken;
}

export interface OAuth2AuthorizationCodeAuthentication extends Authentication {
    clientRegistration: ClientRegistration;
    authorizationExchange: AuthorizationExchange;
    accessToken: AccessToken;
    refreshToken?: RefreshToken;
    additionalParameters: { [key: string]: any };
}
