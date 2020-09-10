import { UserResponseClient, OAuth2UserRequest, MISSING_USER_INFO_URI_ERROR_CODE,
    MISSING_USER_NAME_ATTRIBUTE_ERROR_CODE, INVALID_USER_INFO_RESPONSE_ERROR_CODE, OAuth2UserResponse } from './endpoint-protocol';
import { Component, Autowired } from '@malagu/core';
import { RestOperations, HttpHeaders, MediaType, HttpMethod } from '@malagu/web';
import { ProviderDetailsManager } from '../provider';
import { OAuth2ParameterNames, OAuth2Error, OAuth2AuthorizationError, OAuth2AuthenticationError, AuthenticationMethod } from '@malagu/oauth2-core';
import * as qs from 'qs';
import { AxiosRequestConfig } from 'axios';

@Component(UserResponseClient)
export class DefaultUserResponseClient implements UserResponseClient<OAuth2UserRequest> {

    @Autowired(RestOperations)
    protected readonly restOperations: RestOperations;

    @Autowired(ProviderDetailsManager)
    protected readonly providerDetailsManager: ProviderDetailsManager;

    async getUserResponse(userRequest: OAuth2UserRequest): Promise<OAuth2UserResponse> {
        const { clientRegistration, accessToken } = userRequest;
        const providerDetails = await this.providerDetailsManager.get(clientRegistration.provider);

        if (!providerDetails?.userInfoEndpoint?.uri) {
            throw new OAuth2AuthenticationError({
                errorCode: MISSING_USER_INFO_URI_ERROR_CODE,
                description: `Missing required UserInfo Uri in UserInfoEndpoint for Client Registration: ${clientRegistration.registrationId}`
            });
        }
        const userNameAttributeName = providerDetails?.userInfoEndpoint?.userNameAttributeName;
        if (!userNameAttributeName) {
            throw new OAuth2AuthenticationError({
                errorCode: MISSING_USER_NAME_ATTRIBUTE_ERROR_CODE,
                description: `Missing required \"user name\" attribute name in UserInfoEndpoint for Client Registration: ${clientRegistration.registrationId}`
            });
        }

        let response;
        try {
            const httpMethod = providerDetails.userInfoEndpoint.authenticationMethod === AuthenticationMethod.Form ? HttpMethod.POST : HttpMethod.GET;
            const config: AxiosRequestConfig = {
                url: providerDetails?.userInfoEndpoint?.uri,
                method: httpMethod,
                headers: {
                    [HttpHeaders.ACCEPT]: MediaType.APPLICATION_JSON
                }
            };
            if (httpMethod === HttpMethod.POST) {
                config.headers[HttpHeaders.CONTENT_TYPE] = `${MediaType.APPLICATION_FORM_URLENCODED};charset=UTF-8`;
                config.data = qs.stringify({
                    [OAuth2ParameterNames.ACCESS_TOKEN]: accessToken.tokenValue
                });
            } else {
                config.headers[HttpHeaders.AUTHORIZATION] = `Bearer ${accessToken.tokenValue}`;

            }
            response = await this.restOperations.request<{ [key: string]: any }>(config);
        } catch (error) {
            const oauth2Error = <OAuth2Error>{
                errorCode: INVALID_USER_INFO_RESPONSE_ERROR_CODE,
                description: `An error occurred while attempting to retrieve the UserInfo Resource: ${error.getMessage()}`
            };
            throw new OAuth2AuthorizationError(oauth2Error, error);
        }

        const { data } = response;

        return {
            username: data[userNameAttributeName],
            userAttributes: data
        };
    }
}
