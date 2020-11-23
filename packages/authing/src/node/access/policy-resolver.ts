import { Component } from '@malagu/core';
import { AUTHING_POLICY_TYPE } from './policy-provider';
import { PolicyResolver, SecurityMetadata } from '@malagu/security/lib/node';
import { Policy } from '@malagu/security';
import * as UrlPattern from 'url-pattern';

@Component(PolicyResolver)
export class AuthingPolicyResolver implements PolicyResolver {

    async resolve(policy: Policy, securityMetadata: SecurityMetadata): Promise<boolean> {
        for (const p of policy.permissionList) {
            const pattern = new UrlPattern(p);
            const result = pattern.match(`${securityMetadata.resource}.${securityMetadata.action}`);
            return !!result;
        }
        return false;
    }

    async support(policy: Policy): Promise<boolean> {
        return policy.type === AUTHING_POLICY_TYPE;
    }
}
