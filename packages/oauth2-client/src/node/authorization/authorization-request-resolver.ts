import { AuthorizationRequestResolver } from './authorization-protocol';
import { AuthorizationRequest, OAuth2ParameterNames,
    AuthorizationGrantType, OidcScopes, PkceParameterNames, ClientAuthenticationMethod, OidcParameterNames, AuthorizationResponseType } from '@malagu/oauth2-core';
import { Component, Autowired, Value, IllegalArgumentError } from '@malagu/core';
import { ClientRegistrationManager, ClientRegistration } from '../registration';
import { RequestMatcher, Context } from '@malagu/web/lib/node';
import { AUTHORIZATION_REQUEST_BASE_URI, DEFAULT_REDIRECT_URI } from '../constants';
import { Base64StringKeyGenerator } from '@malagu/security/lib/node';
import { SHA256, enc } from 'crypto-js';
import { ProviderDetailsManager } from '../provider';
import * as qs from 'qs';
import { PathResolver, ENDPOINT, UrlUtil } from '@malagu/web';

export const REGISTRATION_ID_URI_VARIABLE_NAME = 'registrationId';

@Component(AuthorizationRequestResolver)
export class DefaultAuthorizationRequestResolver implements AuthorizationRequestResolver {

    @Autowired(ClientRegistrationManager)
    protected readonly clientRegistrationManager: ClientRegistrationManager;

    @Autowired(ProviderDetailsManager)
    protected readonly providerDetailsManager: ProviderDetailsManager;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(Base64StringKeyGenerator)
    protected readonly base64StringKeyGenerator: Base64StringKeyGenerator;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Value(AUTHORIZATION_REQUEST_BASE_URI)
    protected readonly authorizationRequestBaseUri: string;

    @Value(DEFAULT_REDIRECT_URI)
    protected readonly defaultRedirectUri: string;

    @Value(ENDPOINT)
    protected readonly endpoint: string;

    async resolve(clientRegistrationId?: string): Promise<AuthorizationRequest | undefined> {
        const registrationId = clientRegistrationId || await this.resolveRegistrationId();
        if (registrationId) {
            const redirectUriAction = this.getAction();
            return this.doResolve(registrationId, redirectUriAction);
        }
    }

    protected async doResolve(registrationId: string, redirectUriAction: string) {
        const clientRegistration = await this.clientRegistrationManager.get(registrationId);
        if (!clientRegistration) {
            throw new IllegalArgumentError(`Invalid Client Registration with Id: ${registrationId}`);
        }
        const attributes: { [key: string]: any } = {};
        attributes[OAuth2ParameterNames.REGISTRATION_ID] = clientRegistration.registrationId;

        if (AuthorizationGrantType.AuthorizationCode === clientRegistration.authorizationGrantType) {
            const additionalParameters: { [key: string]: any } = {};
            const scopes = clientRegistration.scopes;
            if (scopes.indexOf(OidcScopes.OPENID)) {
                await this.addNonceParameters(attributes, additionalParameters);
            }
            if (ClientAuthenticationMethod.None === clientRegistration.clientAuthenticationMethod) {
                await this.addPkceParameters(attributes, additionalParameters);
            }
            const providerDetails = await this.providerDetailsManager.get(clientRegistration.provider);
            if (!providerDetails) {
                throw new IllegalArgumentError(`Invalid Provider Details with Id: ${clientRegistration.provider}`);
            }
            const authorizationRequest = <AuthorizationRequest>{
                authorizationGrantType: clientRegistration.authorizationGrantType,
                responseType: clientRegistration.authorizationGrantType === AuthorizationGrantType.AuthorizationCode ? AuthorizationResponseType.Code : undefined,
                clientId: clientRegistration.clientId,
                authorizationUri: providerDetails.authorizationUri,
                redirectUri: await this.expandRedirectUri(clientRegistration, redirectUriAction),
                scopes: clientRegistration.scopes,
                state: await this.base64StringKeyGenerator.generateKey(),
                attributes,
                additionalParameters
            };
            authorizationRequest.authorizationRequestUri = `${authorizationRequest.authorizationUri}?${qs.stringify(this.getParameters(authorizationRequest))}`;
            return authorizationRequest;
        }

        throw new IllegalArgumentError(
            `Invalid Authorization Grant Type (${clientRegistration.authorizationGrantType}) for Client Registration with Id: ${clientRegistration.registrationId}`);

    }

    protected getParameters(authorizationRequest: AuthorizationRequest) {
        const parameters: { [key: string]: string } = {};
        parameters[OAuth2ParameterNames.RESPONSE_TYPE] = authorizationRequest.responseType;
        parameters[OAuth2ParameterNames.CLIENT_ID] = authorizationRequest.clientId;
        if (authorizationRequest.scopes) {
            parameters[OAuth2ParameterNames.SCOPE] = authorizationRequest.scopes.join(' ');
        }
        if (authorizationRequest.state) {
            parameters[OAuth2ParameterNames.STATE] = authorizationRequest.state;
        }
        if (authorizationRequest.redirectUri) {
            parameters[OAuth2ParameterNames.REDIRECT_URI] = authorizationRequest.redirectUri;
        }
        for (const key in authorizationRequest.additionalParameters) {
            if (Object.prototype.hasOwnProperty.call(authorizationRequest.additionalParameters, key)) {
                parameters[key] = authorizationRequest.additionalParameters[key];
            }
        }
        return parameters;
    }

    protected expandRedirectUri(clientRegistration: ClientRegistration, action: string) {
        const redirectUri = clientRegistration.redirectUri || this.defaultRedirectUri;
        return this.pathResolver.resolve(UrlUtil.isAbsoluteUrl(redirectUri) ? '' : this.endpoint,
            redirectUri.replace('{action}', action).replace(`{${REGISTRATION_ID_URI_VARIABLE_NAME}}`, clientRegistration.registrationId));
    }

    protected async addNonceParameters(attributes: { [key: string]: any }, additionalParameters: { [key: string]: any }) {
        const nonce = await this.base64StringKeyGenerator.generateKey(96);
        const nonceHash = this.createHash(nonce);
        attributes[OidcParameterNames.NONCE] = nonce;
        additionalParameters[OidcParameterNames.NONCE] = nonceHash;
    }

    protected async addPkceParameters(attributes: { [key: string]: any }, additionalParameters: { [key: string]: any }) {
        const codeVerifier = await this.base64StringKeyGenerator.generateKey(96);
        attributes[PkceParameterNames.CODE_VERIFIER] = codeVerifier;
        const codeChallenge = this.createHash(codeVerifier);
        additionalParameters[PkceParameterNames.CODE_CHALLENGE] = codeChallenge;
        additionalParameters[PkceParameterNames.CODE_CHALLENGE_METHOD] = 'S256';
    }

    protected createHash(nonce: string) {
        return enc.Base64.stringify(SHA256(nonce));
    }

    protected async resolveRegistrationId(): Promise<string | undefined> {
        const params = await this.requestMatcher.match(`${this.authorizationRequestBaseUri}/:${REGISTRATION_ID_URI_VARIABLE_NAME}`);
        if (params) {
            return params[REGISTRATION_ID_URI_VARIABLE_NAME];
        }
    }

    protected getAction(defaultAction = 'login') {
        return <string>Context.getRequest().query['action'] || defaultAction;
    }

}
