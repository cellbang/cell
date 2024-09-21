import { AuthenticationMethod } from '@celljs/oauth2-core';

export const ProviderDetailsManager = Symbol('ProviderDetailsManager');

export interface ProviderDetails {
    authorizationUri: string;
    tokenUri: string;
    userInfoEndpoint: UserInfoEndpoint;
    jwkSetUri: string;
    issuerUri: string;
    configurationMetadata: { [key: string]: any };
}

export interface UserInfoEndpoint {
    uri: string;
    authenticationMethod: AuthenticationMethod;
    userNameAttributeName: string;
}

export interface ProviderDetailsManager {

    get(providerId: string): Promise<ProviderDetails | undefined>;

}
