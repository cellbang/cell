import { Component, Autowired, Value } from '@malagu/core';
import { Context, RequestMatcher } from '@malagu/web/lib/node';
import { UserService, UserChecker, BadCredentialsError, AuthenticationProvider,
    Authentication, USERNAME_PASSWORD_AUTHENTICATION_PROVIDER_PRIORITY } from '@malagu/security/lib/node';
import { User } from '@malagu/security';
import axios from 'axios';
import { URLSearchParams } from 'url';
import { AuthingProvider } from './authing-provider';
import { HttpMethod } from '@malagu/web';

@Component(AuthenticationProvider)
export class AuthingSSOAuthenticationProvider implements AuthenticationProvider {

    @Value('malagu.security')
    protected readonly securityOptions: any;

    @Value('malagu.authing.sso')
    protected readonly ssoOptions: any;

    @Autowired(UserService)
    protected readonly userService: UserService<string, User>;

    @Autowired(UserChecker)
    protected readonly userChecker: UserChecker;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(AuthingProvider)
    protected readonly authingProvider: AuthingProvider;

    priority = USERNAME_PASSWORD_AUTHENTICATION_PROVIDER_PRIORITY + 100;

    async authenticate(): Promise<Authentication | undefined> {
        const request = Context.getRequest();
        let user;
        if (request.method.toUpperCase() === HttpMethod.POST) {
            const rawUser = request.body;
            if (!rawUser || !rawUser._id) {
                throw new BadCredentialsError('Bad credentials');
            }
            const { token } = rawUser;
            const result = await this.authingProvider.provide().checkLoginStatus(token);
            if (!result.status) {
                throw new BadCredentialsError(result.message);
            };
            user = await this.userService.load(rawUser);
        } else {
            const code = <string>request.query.code;
            let accessToken = <string>request.query.access_token;
            if (!code || accessToken) {
                throw new BadCredentialsError('Bad credentials');
            }
            if (!accessToken) {
                accessToken = await this.getAccessTokenByCode(code);
            }
            user = await this.userService.load(accessToken);
        }
        await this.userChecker.check(user);

        return {
            name: user.username,
            principal: user,
            credentials: '',
            policies: user.policies,
            authenticated: true
        };

    }

    protected async getAccessTokenByCode(code: string) {
        const { id, secret, redirectUri } = this.ssoOptions;
        const { data } = await axios.post('https://sso.authing.cn/oauth/oidc/token',
            new URLSearchParams({
                code,
                client_id: id,
                client_secret: secret,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return data.access_token;
    }

    async support(): Promise<boolean> {
        return !!await this.requestMatcher.match(this.securityOptions.loginUrl);
    }

}
