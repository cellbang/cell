import { Component } from '@malagu/core';
import { AUTHING_POLICY_TYPE } from './policy-provider';
import { PolicyResolver, SecurityMetadata, ACCESS_GRANTED, ACCESS_DENIED, ACCESS_ABSTAIN } from '@malagu/security/lib/node';
import { Policy } from '@malagu/security';
import * as minimatch from 'minimatch';

@Component(PolicyResolver)
export class AuthingPolicyResolver implements PolicyResolver {

    async resolve(policy: Policy, securityMetadata: SecurityMetadata): Promise<number> {
        for (const p of policy.permissionList) {
            const result = minimatch(`${securityMetadata.resource}.${securityMetadata.action}`, p);
            return result ? ACCESS_GRANTED : ACCESS_DENIED;
        }
        return ACCESS_ABSTAIN;
    }

    async support(policy: Policy, securityMetadata: SecurityMetadata): Promise<boolean> {
        return policy.type === AUTHING_POLICY_TYPE;
    }
}
