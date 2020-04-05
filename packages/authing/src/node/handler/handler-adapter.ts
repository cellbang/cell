import { Component, Autowired, Value } from '@malagu/core';
import { LOGIN_PAGE_HANDLER_ADAPTER_PRIORITY, LOGIN_PAGE_TEMPLATE, LOGOUT_PAGE_HANDLER_ADAPTER_PRIORITY, LOGOUT_PAGE_TEMPLATE } from './handler-protocol';
import { RequestMatcher, HandlerAdapter, Context } from '@malagu/web/lib/node';
import { PathResolver } from '@malagu/web';
import { render } from 'mustache';
import { SecurityContext } from '@malagu/security/lib/node';

@Component([HandlerAdapter, LoginPageHandlerAdapter])
export class LoginPageHandlerAdapter implements HandlerAdapter {

    readonly priority = LOGIN_PAGE_HANDLER_ADAPTER_PRIORITY;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Value('malagu.security')
    protected readonly securityOptions: any;

    @Value('malagu.authing')
    protected readonly authingOptions: any;

    async handle(): Promise<void> {
        const response = Context.getResponse();
        this.authingOptions.sso = this.authingOptions.sso || {};
        response.setHeader('Content-type', 'text/html');
        const guardOptions = { ...this.authingOptions.guardOptions, ...{
            appId: this.authingOptions.sso.id,
            domain: this.authingOptions.sso.domain
        }};
        response.body = render(LOGIN_PAGE_TEMPLATE, {
            userPoolId: this.authingOptions.userPool.id,
            guardOptionsStr: JSON.stringify(guardOptions),
            guardOptions: guardOptions,
            loginSuccessUrl: this.securityOptions.loginSuccessUrl,
            loginUrl: this.securityOptions.loginUrl
        });
    }

    async canHandle(): Promise<boolean> {
        return this.requestMatcher.match(await this.pathResolver.resolve(this.securityOptions.loginPage), 'GET');
    }

}

@Component([LogoutPageHandlerAdapter, HandlerAdapter])
export class LogoutPageHandlerAdapter implements HandlerAdapter {

    readonly priority = LOGOUT_PAGE_HANDLER_ADAPTER_PRIORITY;

    @Autowired(RequestMatcher)
    protected readonly requestMatcher: RequestMatcher;

    @Autowired(PathResolver)
    protected readonly pathResolver: PathResolver;

    @Value('malagu.security')
    protected readonly securityOptions: any;

    @Value('malagu.authing')
    protected readonly authingOptions: any;

    async handle(): Promise<void> {
        const response = Context.getResponse();
        this.authingOptions.sso = this.authingOptions.sso || {};
        response.setHeader('Content-type', 'text/html');

        response.body = render(LOGOUT_PAGE_TEMPLATE, {
            userPoolId: this.authingOptions.userPool.id,
            logoutSuccessUrl: this.securityOptions.logoutSuccessUrl,
            logoutUrl: this.securityOptions.logoutUrl,
            isSSO: !!this.authingOptions.sso.id,
            userId: SecurityContext.getAuthentication().principal.username,
            sso: { id: this.authingOptions.sso.id, type: this.authingOptions.sso.type, domain: this.authingOptions.sso.domain }
        });
    }

    async canHandle(): Promise<boolean> {
        return this.requestMatcher.match(await this.pathResolver.resolve(this.securityOptions.logoutUrl), 'GET');
    }

}

