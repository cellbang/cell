import { Component, Autowired, Value } from '@malagu/core';
import { AuthenticationProvider, Authentication, DEFAULT_AUTHENTICATION_PROVIDER_PRIORITY } from './authentication-protocol';
import { Context, RequestMatcher, RedirectStrategy } from '@malagu/web/lib/node';
import { PasswordEncoder } from '../crypto';
import { UserService, UserChecker, User } from '../user';
import { BadCredentialsError } from '../error';
import { PathResolver } from '@malagu/web';

@Component(AuthenticationProvider)
export class AuthenticationProviderImpl implements AuthenticationProvider {

    @Value('malagu.security')
    protected readonly options: any;

    @Autowired(PasswordEncoder)
    protected readonly passwordEncoder: PasswordEncoder;

    @Autowired(UserService)
    protected readonly userService: UserService<string, User>;

    @Autowired(UserChecker)
    protected readonly userChecker: UserChecker;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Autowired(RedirectStrategy)
    protected readonly redirectStrategy: RedirectStrategy;

    priority = DEFAULT_AUTHENTICATION_PROVIDER_PRIORITY;

    async authenticate(): Promise<Authentication | undefined> {
        const username = this.doGetValue(this.options.usernameKey);
        const password = this.doGetValue(this.options.passwordKey);
        if (!password || !username) {
            throw new BadCredentialsError('Bad credentials');
        }
        const user = await this.userService.load(username);
        await this.userChecker.check(user);
        if (!await this.passwordEncoder.matches(password, user.password)) {
            throw new BadCredentialsError('Bad credentials');
        }

        return {
            name: user.username,
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
    }

    async support(): Promise<boolean> {
        return !!await this.requestMatcher.match(await this.pathResolver.resolve(this.options.loginUrl), this.options.loginMethod);
    }

}
