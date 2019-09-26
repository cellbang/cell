import { Component, Value, Autowired } from '@malagu/core';
import { SecurityContextStore, SecurityContext, SecurityContextStrategy } from './context-protocol';
import { Context } from '@malagu/core/lib/node';

@Component(SecurityContextStore)
export class SessionSecurityContextStore implements SecurityContextStore {

    @Value('malagu.security')
    protected readonly options: any;

    @Autowired(SecurityContextStrategy)
    protected readonly securityContextStrategy: SecurityContextStrategy;

    async load(): Promise<SecurityContext> {
        const context = Context.getSession()[this.options.contextKey];
        if (!context) {
            return await this.securityContextStrategy.create();
        }
        return context;
    }
    async save(context: SecurityContext): Promise<void> {
        Context.getSession()[this.options.contextKey] = context;
    }

}
