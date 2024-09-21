import { AuthenticationSuccessHandler, Authentication } from './authentication-protocol';
import { Component, Value, Autowired, Logger } from '@celljs/core';
import { Context, RedirectStrategy } from '@celljs/web/lib/node';
import { HttpHeaders, XML_HTTP_REQUEST } from '@celljs/http';
import { RequestCache } from '../cache';

@Component(AuthenticationSuccessHandler)
export class DefaultAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Value('cell.security.targetUrlParameter')
    protected readonly targetUrlParameter: string;

    @Value('cell.security.loginSuccessUrl')
    protected readonly loginSuccessUrl: string;

    @Value('cell.security.alwaysUseLoginSuccessUrl')
    protected readonly alwaysUseLoginSuccessUrl: boolean;

    @Value('cell.security.useReferer')
    protected readonly useReferer: boolean;

    @Autowired(Logger)
    protected readonly logger: Logger;

    @Autowired(RedirectStrategy)
    protected readonly redirectStrategy: RedirectStrategy;

    @Autowired(RequestCache)
    protected readonly requestCache: RequestCache;

    async onAuthenticationSuccess(authentication: Authentication): Promise<void> {
        const response = Context.getResponse();
        if (Context.getRequest().get(HttpHeaders.X_REQUESTED_WITH) === XML_HTTP_REQUEST) {
            return;
        }
        if (!this.loginSuccessUrl) {
            return;
        }
        const targetUrl = await this.determineTargetUrl(authentication);
        if (response.writableEnded) {
            this.logger.debug(`Response has already been committed. Unable to redirect to ${targetUrl}`);
            return;
        }
        await this.redirectStrategy.send(targetUrl);
     }

    protected async determineTargetUrl(authentication: Authentication) {
        if (this.alwaysUseLoginSuccessUrl) {
            return this.loginSuccessUrl;
        }

        let targetUrl: string | undefined;
        const request = Context.getRequest();
        if (this.targetUrlParameter) {
            targetUrl = <string | undefined>request.query[this.targetUrlParameter];
            if (targetUrl) {
                this.logger.debug(`Found targetUrlParameter in request: ${targetUrl}`);
                return targetUrl;
            }
        }

        if (this.useReferer) {
            const referer = request.get(HttpHeaders.REFERER);
            targetUrl = referer?.length ? referer[0] : '';
            this.logger.debug(`Using Referer header: ${targetUrl}`);
        }

        const savedRequest = await this.requestCache.get();
        if (savedRequest) {
            await this.requestCache.remove();
            targetUrl = savedRequest.redirectUrl;
            this.logger.debug(`Redirecting to SavedRequest Url: ${targetUrl}`);
        }

        if (!targetUrl) {
            targetUrl = this.loginSuccessUrl;
            this.logger.debug(`Using default Url: ${targetUrl}`);
        }

        return targetUrl;
    }

}
