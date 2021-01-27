import { Component, Autowired, Optional, getOwnMetadata } from '@malagu/core';
import {
    SecurityMetadataSource, SecurityMetadata, MethodSecurityMetadataContext,
    SecurityExpressionContextHandler, SECURITY_EXPRESSION_CONTEXT_KEY, ActionNameResolver } from './access-protocol';
import { SecurityContext } from '../context';
import { METADATA_KEY } from '../constants';
import { Context } from '@malagu/web/lib/node';
import { Policy } from '../../common';

@Component(SecurityMetadataSource)
export class MethodSecurityMetadataSource implements SecurityMetadataSource {

    @Autowired(SecurityExpressionContextHandler) @Optional()
    protected readonly securityExpressionContextHandler: SecurityExpressionContextHandler;

    @Autowired(ActionNameResolver)
    protected readonly actionNameResolver: ActionNameResolver;

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
        const action = await this.actionNameResolver.resolve(context);
        return {
            authorizeType: context.authorizeType,
            principal: SecurityContext.getAuthentication().principal,
            action,
            resource: '',
            policies: policies,
            get grant() {
                return ctx.grant;
            },
            set grant(grant: number) {
                ctx.grant = grant;
            }
        };
    }
}
