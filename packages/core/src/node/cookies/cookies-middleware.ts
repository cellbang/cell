import { Middleware } from '../middleware';
import { Context } from '../context';
import { Component, Autowired } from '../../common';
import * as _Cookies from 'cookies';
import { CookiesFactory } from './cookies-factory';

@Component(Middleware)
export class CookiesMiddleware implements Middleware {

    @Autowired(CookiesFactory)
    protected readonly cookiesFactory: CookiesFactory;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        if (ctx.request) {
            Context.setCookies(await this.cookiesFactory.create());
        }
        await next();
    }

    readonly priority = 1000;

}
