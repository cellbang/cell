import { Policy, ElPolicy, PolicyResolver, SecurityMetadata, PolicyType, SECURITY_EXPRESSION_CONTEXT_KEY } from './access-protocol';
import { eval } from 'jexl';
import { Component } from '@malagu/core';
import { Context } from '@malagu/web/lib/node';

@Component(PolicyResolver)
export class ElPolicyResolver implements PolicyResolver {

    resolve(policy: ElPolicy, securityMetadata: SecurityMetadata): Promise<boolean> {
        return eval(policy.el, policy.context || Context.getAttr(SECURITY_EXPRESSION_CONTEXT_KEY));
    }

    async support(policy: Policy): Promise<boolean> {
        return policy.type === PolicyType.El;
    }
}
