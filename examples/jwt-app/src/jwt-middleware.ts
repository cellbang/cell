import { Autowired, Component } from '@celljs/core';
import { HttpHeaders } from '@celljs/web';
import { Context, Middleware, HTTP_MIDDLEWARE_PRIORITY } from '@celljs/web/lib/node';
import { AuthenticationError } from './error';
import { JwtService } from '@celljs/jwt'
import { SecurityContext } from './context';

export const AUTHENTICATION_SCHEME_BEARER = 'Bearer';

@Component(Middleware)
export class JwtMiddleware implements Middleware {

    @Autowired(JwtService)
    protected readonly jwtService: JwtService;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        const request = ctx.request;
        let header = request.get(HttpHeaders.AUTHORIZATION) ?? '';
        header = header.trim();

        if (header.toLowerCase().startsWith(AUTHENTICATION_SCHEME_BEARER.toLowerCase())) {
            const token = header.substring(7);
            try {
                const decoded = await this.jwtService.verify(token);
                SecurityContext.setAuthentication(decoded);
            } catch (error) {
                throw new AuthenticationError('Authentication failed');
            }
        }
        
        await next();
    }

    priority: number = HTTP_MIDDLEWARE_PRIORITY - 10;

}