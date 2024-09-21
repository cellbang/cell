import { ClientRegistration } from '../registration';
import { AuthorizationExchange, AuthorizationGrantType, AccessToken, RefreshToken, AccessTokenResponse } from '@celljs/oauth2-core';

export const UserResponseClient = Symbol('UserResponseClient');

export const MISSING_USER_INFO_URI_ERROR_CODE = 'missing_user_info_uri';
export const MISSING_USER_NAME_ATTRIBUTE_ERROR_CODE = 'missing_user_name_attribute';
export const INVALID_USER_INFO_RESPONSE_ERROR_CODE = 'invalid_user_info_response';

export const INVALID_TOKEN_RESPONSE_ERROR_CODE = 'invalid_token_response';

export interface AuthorizationGrantRequest {
    authorizationGrantType: AuthorizationGrantType;
}

export interface AuthorizationCodeGrantRequest extends AuthorizationGrantRequest {
    clientRegistration: ClientRegistration;
    authorizationExchange: AuthorizationExchange;
}

export interface ClientCredentialsGrantRequest extends AuthorizationGrantRequest {
    clientRegistration: ClientRegistration;
}

export interface PasswordGrantRequest extends AuthorizationGrantRequest {
    clientRegistration: ClientRegistration;
    username: string;
    password: string;
}

export interface RefreshTokenGrantRequest extends AuthorizationGrantRequest {
    clientRegistration: ClientRegistration;
    accessToken: AccessToken;
    refreshToken: RefreshToken;
    scopes?: string[];
}

export interface AccessTokenResponseClient<T extends AuthorizationGrantRequest> {
    getTokenResponse(authorizationRequest: T): Promise<AccessTokenResponse>;
}

export interface OAuth2UserRequest {
    clientRegistration: ClientRegistration;
    accessToken: AccessToken;
    additionalParameters: { [key: string]: any };
}

export interface OAuth2UserResponse {
    username: string;
    userAttributes: { [key: string]: any }
}

export interface UserResponseClient<T extends OAuth2UserRequest> {
    getUserResponse(authorizationRequest: T): Promise<OAuth2UserResponse>;
}
