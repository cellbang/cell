import { AuthorizationRequest, AccessToken, RefreshToken, OAuth2AuthorizationError } from '@celljs/oauth2-core';
import { ClientRegistration } from '../registration';
import { Authentication, AUTHENTICATION_MIDDLE_PRIORITY } from '@celljs/security/lib/node';

export const AuthorizationRequestResolver = Symbol('AuthorizationRequestResolver');
export const AuthorizedClientManager = Symbol('AuthorizedClientManager');
export const AuthorizationRequestManager = Symbol('AuthorizationRequestManager');
export const AuthorizedClientService = Symbol('AuthorizedClientService');
export const AuthorizedClientProvider = Symbol('AuthorizedClientProvider');
export const ContextAttributesMapper = Symbol('ContextAttributesMapper');
export const AuthorizationSuccessHandler = Symbol('AuthorizationSuccessHandler');
export const AuthorizationFailureHandler = Symbol('AuthorizationFailureHandler');

export const AUTHORIZATION_REQUEST_REDIRECT_MIDDLEWARE_PRIORITY = AUTHENTICATION_MIDDLE_PRIORITY + 50;
export const AUTHORIZATION_CODE_GRANT_MIDDLEWARE_PRIORITY = AUTHENTICATION_MIDDLE_PRIORITY - 100;
export const INVALID_STATE_PARAMETER_ERROR_CODE = 'invalid_state_parameter';

export interface AuthorizationRequestResolver {

    resolve(clientRegistrationId?: string): Promise<AuthorizationRequest | undefined>;

}

export interface AuthorizedClient {
    clientRegistration: ClientRegistration;
    principalName: string;
    accessToken: AccessToken;
    refreshToken?: RefreshToken;
}

export interface AuthorizedClientManager<T extends AuthorizedClient> {

    get(clientRegistrationId: string, principalName: string): Promise<T | undefined>;

    save(authorizedClient: T, principalName: string): Promise<void>;

    remove(clientRegistrationId: string, principalName: string): Promise<void>;

}

export interface AuthorizationRequestManager<T extends AuthorizationRequest> {

    get(): Promise<T | undefined>;

    save(authorizationRequest: T): Promise<void>;

    remove(): Promise<T | undefined>;

}

export interface AuthorizeRequest {
    clientRegistrationId: string;
    authorizedClient: AuthorizedClient;
    principal: Authentication;
    attributes?: Map<string, any>;
}

export interface AuthorizedClientService {
    authorize(authorizeRequest: AuthorizeRequest): Promise<AuthorizedClient | undefined>;
}

export interface AuthorizationContext {
    clientRegistration: ClientRegistration;
    authorizedClient?: AuthorizedClient;
    principal: Authentication;
    attributes: Map<string, any>;
}

export namespace AuthorizationContext {

    /**
     * The name of the attributes in the context associated
     * to the value for the "request scope(s)".
     */
    export const REQUEST_SCOPE_ATTRIBUTE_NAME = 'AuthorizationContext.REQUEST_SCOPE';

    /**
     * The name of the attributes in the context associated
     * to the value for the resource owner's username.
     */
    export const USERNAME_ATTRIBUTE_NAME = 'AuthorizationContext.USERNAME';

    /**
     * The name of the attributes in the context associated
     * to the value for the resource owner's password.
     */
    export const PASSWORD_ATTRIBUTE_NAME = 'AuthorizationContext.PASSWORD';
}

export interface AuthorizedClientProvider {
    provide(context: AuthorizationContext): Promise<AuthorizedClient | undefined>;
}

export interface ContextAttributesMapper {
    apply(authorizeRequest: AuthorizeRequest): Promise<Map<string, any>>;
}

export interface AuthorizationSuccessHandler {
    onAuthorizationSuccess(authorizedClient: AuthorizedClient, principal: Authentication): Promise<void>;
}

export interface AuthorizationFailureHandler {
    onAuthorizationFailure(oauth2AuthorizationError: OAuth2AuthorizationError, principal: Authentication): Promise<void>;
}
