import { Component, Autowired } from '@malagu/core';
import { UserService } from '@malagu/security/lib/node';
import { User } from '@malagu/security';
import { OAuth2UserRequest, UserResponseClient, MISSING_USER_INFO_URI_ERROR_CODE, MISSING_USER_NAME_ATTRIBUTE_ERROR_CODE } from '../endpoint';
import { ProviderDetailsManager } from '../provider';
import { OAuth2AuthenticationError } from '@malagu/oauth2-core';

@Component()
export class OAuth2UserService implements UserService<OAuth2UserRequest, User> {

    @Autowired(ProviderDetailsManager)
    protected readonly providerDetailsManager: ProviderDetailsManager;

    @Autowired(UserResponseClient)
    protected readonly userResponseClient: UserResponseClient<OAuth2UserRequest>;

    async load(userRequest: OAuth2UserRequest): Promise<User> {
        const { clientRegistration } = userRequest;
        const providerDetails = await this.providerDetailsManager.get(clientRegistration.provider);
        if (!providerDetails?.userInfoEndpoint.uri) {
            throw new OAuth2AuthenticationError({
                errorCode: MISSING_USER_INFO_URI_ERROR_CODE,
                description: `Missing required UserInfo Uri in UserInfoEndpoint for Client Registration: ${clientRegistration.registrationId}`
            });
        }
        const userNameAttributeName = providerDetails.userInfoEndpoint.userNameAttributeName;
        if (!userNameAttributeName) {
            throw new OAuth2AuthenticationError({
                errorCode: MISSING_USER_NAME_ATTRIBUTE_ERROR_CODE,
                description: `Missing required "user name" attribute name in UserInfoEndpoint for Client Registration: ${clientRegistration.registrationId}`
            });
        }
        const { userAttributes } = await this.userResponseClient.getUserResponse(userRequest);

        const claims = userAttributes;

        return {
            type: clientRegistration.registrationId,
            username: claims[userNameAttributeName],
            password: '',
            accountNonExpired: true,
            accountNonLocked: true,
            credentialsNonExpired: true,
            enabled: true,
            policies: [],
            claims
        };
    }
}

