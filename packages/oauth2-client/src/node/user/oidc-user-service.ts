import { Value, Component, Autowired } from '@malagu/core';
import { UserService } from '@malagu/security/lib/node';
import { User } from '@malagu/security';
import { OidcUserRequest } from './user-protocol';
import { OAuth2UserRequest, UserResponseClient, INVALID_USER_INFO_RESPONSE_ERROR_CODE } from '../endpoint';
import { ProviderDetailsManager } from '../provider';
import { AuthorizationGrantType, StandardClaimNames, OAuth2AuthenticationError, IdTokenClaimNames } from '@malagu/oauth2-core';

@Component()
export class OidcUserService implements UserService<OidcUserRequest, User> {

    @Value('malagu.oauth2.client.accessibleScopes')
    protected readonly accessibleScopes: string[];

    @Autowired(ProviderDetailsManager)
    protected readonly providerDetailsManager: ProviderDetailsManager;

    @Autowired(UserResponseClient)
    protected readonly userResponseClient: UserResponseClient<OAuth2UserRequest>;

    async load(userRequest: OidcUserRequest): Promise<User> {
        const { idToken, clientRegistration } = userRequest;
        let claims: { [key: string]: any } = {};
        if (await this.shuldRetrieveuserInfo(userRequest)) {
            const { userAttributes } = await this.userResponseClient.getUserResponse(userRequest);
            claims = { ...userAttributes };
            const subject = claims[StandardClaimNames.SUB];

            // https://openid.net/specs/openid-connect-core-1_0.html#UserInfoResponse

            // 1) The sub (subject) Claim MUST always be returned in the UserInfo Response
            if (!subject) {
                throw new OAuth2AuthenticationError({
                    errorCode: INVALID_USER_INFO_RESPONSE_ERROR_CODE
                });
            }

            // 2) Due to the possibility of token substitution attacks (see Section 16.11),
            // the UserInfo Response is not guaranteed to be about the End-User
            // identified by the sub (subject) element of the ID Token.
            // The sub Claim in the UserInfo Response MUST be verified to exactly match
            // the sub Claim in the ID Token; if they do not match,
            // the UserInfo Response values MUST NOT be used.
            if (subject !== idToken.payload[IdTokenClaimNames.SUB]) {
                throw new OAuth2AuthenticationError({
                    errorCode: INVALID_USER_INFO_RESPONSE_ERROR_CODE
                });
            }

        }

        claims = { ...claims, ...idToken.payload };
        const providerDetails = await this.providerDetailsManager.get(clientRegistration.provider);
        const userNameAttributeName = providerDetails?.userInfoEndpoint?.userNameAttributeName || IdTokenClaimNames.SUB;

        return {
            type: clientRegistration.registrationId,
            username: claims[userNameAttributeName],
            password: '',
            accountNonExpired: true,
            accountNonLocked: true,
            credentialsNonExpired: true,
            enabled: true,
            policies: [],
            claims,
            idToken
        };
    }

    protected async shuldRetrieveuserInfo(userRequest: OidcUserRequest) {
        const { clientRegistration, accessToken } = userRequest;
        const providerDetails = await this.providerDetailsManager.get(clientRegistration.provider);

        // Auto-disabled if UserInfo Endpoint URI is not provided
        if (!providerDetails?.userInfoEndpoint?.uri) {
            return false;
        }

        // The Claims requested by the profile, email, address, and phone scope values
        // are returned from the UserInfo Endpoint (as described in Section 5.3.2),
        // when a response_type value is used that results in an Access Token being issued.
        // However, when no Access Token is issued, which is the case for the response_type=id_token,
        // the resulting Claims are returned in the ID Token.
        // The Authorization Code Grant Flow, which is response_type=code, results in an Access Token being issued.
        if (AuthorizationGrantType.AuthorizationCode === clientRegistration.authorizationGrantType) {

            // Return true if there is at least one match between the authorized scope(s) and accessible scope(s)
            return !this.accessibleScopes?.length || this.accessibleScopes.some(v => accessToken.scopes.indexOf(v) !== -1);
        }
        return false;
    }
}
