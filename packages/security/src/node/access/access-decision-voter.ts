import { SecurityMetadata, AccessDecisionVoter, ACCESS_DENIED, ACCESS_GRANTED, ACCESS_ABSTAIN,
    POLICY_BASED_VOTER_PRIORITY, PolicyResolver, PolicyProvider, TENANT_VOTER_PRIORITY } from './access-protocol';
import { Component, Autowired } from '@malagu/core';
import { Context } from '@malagu/web/lib/node';
import { SecurityContext } from '../context';

@Component(AccessDecisionVoter)
export class PolicyBasedVoter implements AccessDecisionVoter {

    readonly priority = POLICY_BASED_VOTER_PRIORITY;

    @Autowired(PolicyResolver)
    protected readonly policyResolvers: PolicyResolver[];

    @Autowired(PolicyProvider)
    protected readonly policyProviders: PolicyProvider[];

    async vote(securityMetadata: SecurityMetadata): Promise<number> {
        const policies = [ ...securityMetadata.policies ];
        const ctx = {
            resource: securityMetadata.resource,
            principal: securityMetadata.principal,
            type: securityMetadata.authorizeType
        };

        for (const policyProvider of this.policyProviders) {
            policies.push(...await policyProvider.provide(ctx));
        }

        for (const policy of policies) {
            for (const policyResolver of this.policyResolvers) {
                if (await policyResolver.support(policy, securityMetadata)) {
                    const result = await policyResolver.resolve(policy, securityMetadata);
                    if (result === ACCESS_GRANTED) {
                        securityMetadata.grant++;
                    } else if (result === ACCESS_DENIED) {
                        return ACCESS_DENIED;
                    }
                }
            }
        }
        if (securityMetadata.grant > 0) {
            return ACCESS_GRANTED;
        }
        if (securityMetadata.grant === 0) {
            return ACCESS_ABSTAIN;
        }
        return ACCESS_DENIED;
    }

    async support(securityMetadata: SecurityMetadata): Promise<boolean> {
        return true;
    }

}

@Component(AccessDecisionVoter)
export class TenantVoter implements AccessDecisionVoter {

    readonly priority = TENANT_VOTER_PRIORITY;

    async vote(securityMetadata: SecurityMetadata): Promise<number> {
        if (Context.getTenant() === SecurityContext.getAuthentication().name) {
            return ACCESS_GRANTED;
        }
        return ACCESS_ABSTAIN;
    }

    async support(securityMetadata: SecurityMetadata): Promise<boolean> {
        return true;
    }

}
