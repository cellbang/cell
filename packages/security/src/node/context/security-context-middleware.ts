import { Middleware, Context } from '@celljs/web/lib/node';
import { Component, Value, Autowired } from '@celljs/core';
import { SecurityContextStore, SecurityContext, SECURITY_CONTEXT_MIDDLEWARE_PRIORITY } from './context-protocol';

@Component(Middleware)
export class SecurityContextMiddleWare implements Middleware {

    @Value('cell.security')
    protected readonly options: any;

    @Autowired(SecurityContextStore)
    protected readonly securityContextStore: SecurityContextStore;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {

        const context = await this.securityContextStore.load();
        try {
            SecurityContext.setCurrent(context);
            Context.setTenant(context.authentication.name);
            await next();
        } finally {
            await this.securityContextStore.save(SecurityContext.getCurrent());
        }
    }

    readonly priority: number = SECURITY_CONTEXT_MIDDLEWARE_PRIORITY;

}
