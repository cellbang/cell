import { AuthorizationGrantType, AuthorizationResponseType } from '../authorization';
import { RefreshToken, AccessToken } from '../token';

export namespace OAuth2ParameterNames {
    /**
     * used in Access Token Request.
     */
    export const GRANT_TYPE = 'grant_type';

    /**
     * used in Authorization Request.
     */
    export const RESPONSE_TYPE = 'response_type';

    /**
     * used in Authorization Request and Access Token Request.
     */
    export const CLIENT_ID = 'client_id';

    /**
     * used in Access Token Request.
     */
    export const CLIENT_SECRET = 'client_secret';

    /**
     * used in Authorization Request and Access Token Request.
     */
    export const REDIRECT_URI = 'redirect_uri';

    /**
     * used in Authorization Request, Authorization Response, Access Token Request and Access Token Response.
     */
    export const SCOPE = 'scope';

    /**
     * used in Authorization Request and Authorization Response.
     */
    export const STATE = 'state';

    /**
     * used in Authorization Response and Access Token Request.
     */
    export const CODE = 'code';

    /**
     * used in Authorization Response and Access Token Response.
     */
    export const ACCESS_TOKEN = 'access_token';

    /**
     * used in Authorization Response and Access Token Response.
     */
    export const TOKEN_TYPE = 'token_type';

    /**
     * used in Authorization Response and Access Token Response.
     */
    export const EXPIRES_IN = 'expires_in';

    /**
     * used in Access Token Request and Access Token Response.
     */
    export const REFRESH_TOKEN = 'refresh_token';

    /**
     * used in Access Token Request.
     */
    export const USERNAME = 'username';

    /**
     * used in Access Token Request.
     */
    export const PASSWORD = 'password';

    /**
     * used in Authorization Response and Access Token Response.
     */
    export const ERROR = 'error';

    /**
     * used in Authorization Response and Access Token Response.
     */
    export const ERROR_DESCRIPTION = 'error_description';

    /**
     * used in Authorization Response and Access Token Response.
     */
    export const ERROR_URI = 'error_uri';

    /**
     * Non-standard parameter (used internally).
     */
    export const REGISTRATION_ID = 'registration_id';

}

export namespace PkceParameterNames {

    /**
     * `code_challenge`- used in Authorization Request.
     */
    export const CODE_CHALLENGE = 'code_challenge';

    /**
     * `code_challenge_method`- used in Authorization Request.
     */
    export const CODE_CHALLENGE_METHOD = 'code_challenge_method';

    /**
     * `code_verifier`- used in Token Request.
     */
    export const CODE_VERIFIER = 'code_verifier';
}

export interface AuthorizationRequest {
    authorizationUri: string;
    authorizationGrantType: AuthorizationGrantType;
    responseType: AuthorizationResponseType;
    clientId: string;
    redirectUri: string;
    scopes: string[];
    state: string;
    additionalParameters: { [key: string]: any };
    authorizationRequestUri: string;
    attributes: { [key: string]: any };
}

export interface AuthorizationResponse {
    redirectUri: string;
    state: string;
    code: string;
    error: OAuth2Error;
}

export interface OAuth2Error {
    errorCode: string;
    description?: string;
    uri?: string;
}

export interface AuthorizationExchange {
    authorizationRequest: AuthorizationRequest;
    authorizationResponse: AuthorizationResponse;
}

export class AccessTokenResponse {
    accessToken: AccessToken;
    refreshToken?: RefreshToken;
    additionalParameters: { [key: string]: any };
}
