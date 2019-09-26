import { Component, Autowired, Optional } from '@malagu/core';
import { SecurityMetadataSource, SecurityMetadata, MethodSecurityMetadataContext,
    SecurityExpressionContextHandler, SECURITY_EXPRESSION_CONTEXT_KEY, ElPoliy } from './access-protocol';
import { SecurityContext } from '../context';
import { METADATA_KEY } from '../constants';
import { AuthorizeMetadata } from '../annotation/authorize';
import { Context } from '@malagu/core/lib/node';

@Component(SecurityMetadataSource)
export class MethodSecurityMetadataSource implements SecurityMetadataSource {

    @Autowired(SecurityExpressionContextHandler) @Optional
    protected readonly securityExpressionContextHandler: SecurityExpressionContextHandler;

    async load(context: MethodSecurityMetadataContext): Promise<SecurityMetadata> {
        const classMetadatas: AuthorizeMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.authorize, context.target.constructor) || [];
        const methodMetadatas: AuthorizeMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.authorize, context.target.constructor, context.method) || [];
        const ctx = {
            ...context,
            ...SecurityContext.getAuthentication()
        };
        Context.setAttr(SECURITY_EXPRESSION_CONTEXT_KEY, ctx);
        if (this.securityExpressionContextHandler) {
            await this.securityExpressionContextHandler.handle(ctx);
        }
        const policies = classMetadatas.concat(...methodMetadatas)
            .filter(item => item.type === context.type)
            .map(item => {
                const policy = new ElPoliy();
                policy.type = item.type;
                policy.el = item.el,
                policy.context = ctx;
                return policy;
            });

        const resource = context.target.name;
        return {
            type: context.type,
            principal: SecurityContext.getAuthentication().principal,
            action: context.method,
            resource,
            policies: policies
        };
    }
}
