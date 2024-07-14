import { Component, Autowired, Value } from '@malagu/core';
import { AuthenticationProvider, Authentication, USERNAME_PASSWORD_AUTHENTICATION_PROVIDER_PRIORITY,
    BASE_AUTHENTICATION_PROVIDER_PRIORITY, AUTHENTICATION_SCHEME_BASIC } from './authentication-protocol';
import { Context, RequestMatcher, RedirectStrategy } from '@malagu/web/lib/node';
import { PasswordEncoder } from '../crypto';
import { UserService, UserChecker, UserMapper } from '../user';
import { BadCredentialsError } from '../error';
import { HttpHeaders } from '@malagu/http';
import { PathResolver } from '@malagu/web';

import { User } from '../../common';

@Component(AuthenticationProvider)
export class UsernamePasswordAuthenticationProvider implements AuthenticationProvider {

    @Value('malagu.security')
    protected readonly options: any;

    @Autowired(PasswordEncoder)
    protected readonly passwordEncoder: PasswordEncoder;

    @Autowired(UserService)
    protected readonly userService: UserService<string, User>;

    @Autowired(UserChecker)
    protected readonly userChecker: UserChecker;

    @Autowired(UserMapper)
    protected readonly userMapper: UserMapper;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Autowired(RedirectStrategy)
    protected readonly redirectStrategy: RedirectStrategy;

    priority = USERNAME_PASSWORD_AUTHENTICATION_PROVIDER_PRIORITY;

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
        await this.userMapper.map(user);
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
            return <string>request.query[key];
        }
    }

    async support(): Promise<boolean> {
        return !!await this.requestMatcher.match(await this.pathResolver.resolve(this.options.loginUrl), this.options.loginMethod);
    }

}

@Component(AuthenticationProvider)
export class BasicAuthenticationProvider implements AuthenticationProvider {

    @Autowired(PasswordEncoder)
    protected readonly passwordEncoder: PasswordEncoder;

    @Autowired(UserService)
    protected readonly userService: UserService<string, User>;

    @Autowired(UserChecker)
    protected readonly userChecker: UserChecker;

    @Autowired(UserMapper)
    protected readonly userMapper: UserMapper;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Autowired(RedirectStrategy)
    protected readonly redirectStrategy: RedirectStrategy;

    priority = BASE_AUTHENTICATION_PROVIDER_PRIORITY;

    async authenticate(): Promise<Authentication | undefined> {
        const request = Context.getRequest();
        const header = request.get(HttpHeaders.AUTHORIZATION)!.trim();

        const token = Buffer.from(header.substring(6), 'base64').toString('utf8');
        if (!token) {
            throw new BadCredentialsError('Empty basic authentication token');
        }
        const delim = token.indexOf(':');
        if (delim === -1) {
            throw new BadCredentialsError('Invalid basic authentication token');
        }
        const username = token.substring(0, delim);
        const password = token.substring(delim);
        if (!password || !username) {
            throw new BadCredentialsError('Bad credentials');
        }
        const user = await this.userService.load(username);
        await this.userChecker.check(user);
        if (!await this.passwordEncoder.matches(password, user.password)) {
            throw new BadCredentialsError('Bad credentials');
        }

        await this.userMapper.map(user);

        return {
            name: user.username,
            principal: user,
            credentials: '',
            policies: user.policies,
            authenticated: true,
            next: true
        };

    }

    async support(): Promise<boolean> {
        const request = Context.getRequest();
        let header = request.get(HttpHeaders.AUTHORIZATION);
        if (!header) {
            return false;
        }
        header = header.trim();
        if (header.toLowerCase().startsWith(AUTHENTICATION_SCHEME_BASIC.toLowerCase())) {
            return true;
        }
        return false;
    }

}

