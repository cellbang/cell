import { Middleware, Context } from '@malagu/core/lib/node';
import { Component, Value, Autowired } from '@malagu/core';
import { SecurityContextStore, SecurityContext, SECURITY_CONTEXT_MIDDLEWARE_PRIORITY } from './context-protocol';

@Component(Middleware)
export class SecurityContextMiddleWare implements Middleware {

    @Value('malagu.security')
    protected readonly options: any;

    @Autowired(SecurityContextStore)
    protected readonly securityContextStore: SecurityContextStore;

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {

        const context = await this.securityContextStore.load();
        try {
            SecurityContext.setCurrent(context);
            await next();
        } finally {
            await this.securityContextStore.save(SecurityContext.getCurrent());
        }
    }

    readonly priority: number = SECURITY_CONTEXT_MIDDLEWARE_PRIORITY;

}
