import { Component, Autowired } from '@celljs/core';
import { OAuth2AuthenticationError, OidcScopes, AccessTokenResponse, OidcParameterNames} from '@celljs/oauth2-core';
import { IdTokenJwtDecoderFactory, ClientRegistration } from '../registration';
import { Jwt } from '@celljs/oauth2-jose';
import { errors } from 'jose';
import { OidcUserRequest, OidcUserService } from '../user';
import { UserService, AuthenticationProvider } from '@celljs/security/lib/node';
import { User } from '@celljs/security';
import { OIDC_AUTHENTICATION_PROVIDER_PRIORITY, INVALID_ID_TOKEN_ERROR_CODE } from './authentication-protocol';
import { OAuth2AuthenticationProvider } from './oauth2-authentication-provider';

@Component(AuthenticationProvider)
export class OidcAuthenticationProvider extends OAuth2AuthenticationProvider {

    @Autowired(IdTokenJwtDecoderFactory)
    protected readonly idTokenJwtDecoderFactory: IdTokenJwtDecoderFactory;

    @Autowired(OidcUserService)
    protected override readonly userService: UserService<OidcUserRequest, User>;

    override priority = OIDC_AUTHENTICATION_PROVIDER_PRIORITY;

    protected override checkScopes(scopes: string[]) {
        // Section 3.1.2.1 Authentication Request - https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
        // scope
        //         REQUIRED. OpenID Connect requests MUST contain the "openid" scope value.
        if (scopes.indexOf(OidcScopes.OPENID) === -1) {
            // This is NOT an OpenID Connect Authentication Request so return undefined
            // and let OAuth2AuthenticationProvider handle it instead
            return false;
        }
        return true;
    }

    protected override async getUserinfo(clientRegistration: ClientRegistration, tokenResponse: AccessTokenResponse, additionalParameters: { [key: string]: string }) {
        const idToken = await this.createOidcToken(clientRegistration, tokenResponse);

        return this.userService.load({
            idToken,
            clientRegistration,
            accessToken: tokenResponse.accessToken,
            additionalParameters
        });
    }

    protected async createOidcToken(clientRegistration: ClientRegistration, tokenResponse: AccessTokenResponse): Promise<Jwt> {
        const jwtDecoder = await this.idTokenJwtDecoderFactory.create(clientRegistration);
        try {
            return jwtDecoder.decode(tokenResponse.additionalParameters[OidcParameterNames.ID_TOKEN]);
        } catch (error) {
            if (error instanceof errors.JOSEError) {
                throw new OAuth2AuthenticationError({
                    errorCode: INVALID_ID_TOKEN_ERROR_CODE,
                    description: error.message
                });
            }
            throw error;
        }
    }
}
