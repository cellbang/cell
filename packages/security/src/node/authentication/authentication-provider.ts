import { Component, Autowired, Value } from '@malagu/core';
import { AuthenticationProvider, Authentication, DEFAULT_AUTHENTICATION_PROVIDER__PRIORITY } from './authentication-protocol';
import { Context, RequestMatcher } from '@malagu/core/lib/node';
import { PasswordEncoder } from '../crypto';
import { UserStore, UserChecker } from '../user';
import { BadCredentialsError } from '../error';

@Component(AuthenticationProvider)
export class AuthenticationProviderImpl implements AuthenticationProvider {

    @Value('malagu.security')
    protected readonly options: any;

    @Autowired(PasswordEncoder)
    protected readonly passwordEncoder: PasswordEncoder;

    @Autowired(UserStore)
    protected readonly userStore: UserStore;

    @Autowired(UserChecker)
    protected readonly userChecker: UserChecker;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    priority = DEFAULT_AUTHENTICATION_PROVIDER__PRIORITY;

    async authenticate(): Promise<Authentication> {
        const username = this.doGetValue(this.options.usernameKey);
        const password = this.doGetValue(this.options.passwordKey);
        if (!password || !username) {
            throw new BadCredentialsError('Bad credentials');
        }
        const user = await this.userStore.load(username);
        await this.userChecker.check(user);
        if (!this.passwordEncoder.matches(password, user.password)) {
            throw new BadCredentialsError('Bad credentials');
        }

        return {
            principal: user,
            credentials: '',
            policies: user.policies,
            authenticated: true
        };

    }

    protected doGetValue(key: string): string {
        const request = Context.getRequest();
        if (request.body) {
            return request.body[key];
        } else {
            return request.query[key];
        }
        return '';
    }

    async support(): Promise<boolean> {
       return this.requestMatcher.match('/login');
    }

}
