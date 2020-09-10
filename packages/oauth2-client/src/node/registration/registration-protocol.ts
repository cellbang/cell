import { ClientAuthenticationMethod, AuthorizationGrantType } from '@malagu/oauth2-core';

export const ClientRegistrationManager = Symbol('ClientRegistrationManager');
export const JwsAlgorithmResolver = Symbol('JwsAlgorithmResolver');
export const MISSING_SIGNATURE_VERIFIER_ERROR_CODE = 'missing_signature_verifier';

export interface ClientRegistration {
    registrationId: string;
    clientId: string;
    clientSecret: string;
    clientAuthenticationMethod: ClientAuthenticationMethod;
    authorizationGrantType: AuthorizationGrantType;
    redirectUri: string;
    scopes: string[];
    provider: string;
    clientName: string;
}

export interface ClientRegistrationManager {

    get(registrationId: string): Promise<ClientRegistration | undefined>;

}

export interface JwsAlgorithmResolver {
    reolve(clientRegistration: ClientRegistration): Promise<string>;
}
