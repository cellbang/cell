import { Policy, ElPoliy, PolicyResolver, SecurityMetadata } from './access-protocol';
import { eval } from 'jexl';
import { Component } from '@malagu/core';

@Component(PolicyResolver)
export class ElPolicyResolver implements PolicyResolver {

    async resolve(policy: ElPoliy, securityMetadata: SecurityMetadata): Promise<boolean> {
        return await eval(policy.el, policy.context);

    }

    async support(policy: Policy): Promise<boolean> {
        return policy instanceof ElPoliy;
    }
}
