import { Component, Autowired, Optional, getOwnMetadata } from '@malagu/core';
import {
    SecurityMetadataSource, SecurityMetadata, MethodSecurityMetadataContext,
    SecurityExpressionContextHandler, SECURITY_EXPRESSION_CONTEXT_KEY, Policy
} from './access-protocol';
import { SecurityContext } from '../context';
import { METADATA_KEY } from '../constants';
import { Context } from '@malagu/web/lib/node';

@Component(SecurityMetadataSource)
export class MethodSecurityMetadataSource implements SecurityMetadataSource {

    @Autowired(SecurityExpressionContextHandler) @Optional
    protected readonly securityExpressionContextHandler: SecurityExpressionContextHandler;

    async load(context: MethodSecurityMetadataContext): Promise<SecurityMetadata> {
        const classPolicies: Policy[] = getOwnMetadata(METADATA_KEY.authorize, context.target.constructor);
        const methodPolicies: Policy[] = getOwnMetadata(METADATA_KEY.authorize, context.target.constructor, context.method);
        const ctx = {
            ...context,
            ...SecurityContext.getAuthentication()
        };
        if (this.securityExpressionContextHandler) {
            await this.securityExpressionContextHandler.handle(ctx);
        }
        Context.setAttr(SECURITY_EXPRESSION_CONTEXT_KEY, ctx);
        const policies = classPolicies.concat(...methodPolicies)
            .filter(item => item.authorizeType === context.authorizeType);

        const resource = context.target.constructor.name;
        return {
            authorizeType: context.authorizeType,
            principal: SecurityContext.getAuthentication().principal,
            action: context.method,
            resource,
            policies: policies
        };
    }
}
