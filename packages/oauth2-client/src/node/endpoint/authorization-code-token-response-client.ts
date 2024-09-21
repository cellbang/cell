import { AccessTokenResponseClient, AuthorizationCodeGrantRequest, INVALID_TOKEN_RESPONSE_ERROR_CODE } from './endpoint-protocol';
import { Component, Autowired } from '@celljs/core';
import { RestOperations } from '@celljs/http';
import { ProviderDetailsManager } from '../provider';
import { AccessTokenResponse, OAuth2ParameterNames, PkceParameterNames, ClientAuthenticationMethod, OAuth2Error, OAuth2AuthorizationError,
    AccessTokenResponseConverter } from '@celljs/oauth2-core';
import { AuthorizationGrantRequestEntityUtil } from '../utils';
import * as qs from 'qs';

@Component()
export class AuthorizationCodeTokenResponseClient implements AccessTokenResponseClient<AuthorizationCodeGrantRequest> {

    @Autowired(RestOperations)
    protected readonly restOperations: RestOperations;

    @Autowired(ProviderDetailsManager)
    protected readonly providerDetailsManager: ProviderDetailsManager;

    @Autowired(AccessTokenResponseConverter)
    protected readonly accessTokenResponseConverter: AccessTokenResponseConverter;

    async getTokenResponse(authorizationCodeGrantRequest: AuthorizationCodeGrantRequest): Promise<AccessTokenResponse> {
        const { clientRegistration } = authorizationCodeGrantRequest;
        const providerDetails = await this.providerDetailsManager.get(clientRegistration.provider);

        let response;
        try {
            response = await this.restOperations.post<{ [key: string]: string }>(providerDetails!.tokenUri, this.buildFormParameters(authorizationCodeGrantRequest), {
                headers: AuthorizationGrantRequestEntityUtil.getTokenRequestHeaders(clientRegistration)
            });
        } catch (error) {
            const oauth2Error = <OAuth2Error>{
                errorCode: INVALID_TOKEN_RESPONSE_ERROR_CODE,
                description: `An error occurred while attempting to retrieve the OAuth 2.0 Access Token Response: ${error?.message || error}`
            };
            throw new OAuth2AuthorizationError(oauth2Error, error);
        }

        const { data } = response;

        const acccessTokenResponse = this.accessTokenResponseConverter.convert(data);

        if (!acccessTokenResponse.accessToken.scopes || acccessTokenResponse.accessToken.scopes.length === 0) {
            // As per spec, in Section 5.1 Successful Access Token Response
            // https://tools.ietf.org/html/rfc6749#section-5.1
            // If AccessTokenResponse.scope is empty, then default to the scope
            // originally requested by the client in the Token Request
            acccessTokenResponse.accessToken.scopes = clientRegistration.scopes;
        }

        return acccessTokenResponse;
    }

    protected buildFormParameters(authorizationCodeGrantRequest: AuthorizationCodeGrantRequest) {
        const { authorizationExchange, clientRegistration, authorizationGrantType } = authorizationCodeGrantRequest;
        const { authorizationRequest, authorizationResponse } = authorizationExchange;
        const formParameters: { [key: string]: any } = {
            [OAuth2ParameterNames.GRANT_TYPE]: authorizationGrantType,
            [OAuth2ParameterNames.CODE]: authorizationResponse.code,
            [OAuth2ParameterNames.REDIRECT_URI]: authorizationRequest.redirectUri,
            [PkceParameterNames.CODE_VERIFIER]: authorizationRequest.attributes[PkceParameterNames.CODE_VERIFIER]
        };
        const { clientAuthenticationMethod, clientId, clientSecret } = clientRegistration;
        if (ClientAuthenticationMethod.Basic !== clientAuthenticationMethod) {
            formParameters[OAuth2ParameterNames.CLIENT_ID] = clientId;
        }
        if (ClientAuthenticationMethod.Post === clientAuthenticationMethod) {
            formParameters[OAuth2ParameterNames.CLIENT_SECRET] = clientSecret;
        }
        return qs.stringify(formParameters);
    }

}
