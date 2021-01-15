import { PolicyResolver, SecurityMetadata, SECURITY_EXPRESSION_CONTEXT_KEY } from './access-protocol';
import { eval } from 'jexl';
import { Component } from '@malagu/core';
import { Context } from '@malagu/web/lib/node';
import { ElPolicy, Policy, PolicyType } from '../../common';

@Component(PolicyResolver)
export class ElPolicyResolver implements PolicyResolver {

    resolve(policy: ElPolicy, securityMetadata: SecurityMetadata): Promise<boolean> {
        // eslint-disable-next-line no-eval
        return eval(policy.el, policy.context || Context.getAttr(SECURITY_EXPRESSION_CONTEXT_KEY));
    }

    async support(policy: Policy): Promise<boolean> {
        return policy.type === PolicyType.El;
    }
}
