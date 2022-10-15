import { PolicyContext, PolicyProvider } from './access-protocol';
import { Component, Value, PostConstruct } from '@malagu/core';
import { AuthorizeType, Policy } from '../../common';
import { contains } from 'micromatch';

@Component(PolicyProvider)
export class PrincipalPolicyProvider implements PolicyProvider {

    async provide(ctx: PolicyContext): Promise<Policy[]> {
        const { principal, type } = ctx;
        const policies: Policy[] = principal && principal.policies || [];
        return policies.filter(p => p.authorizeType === type);
    }
}

@Component(PolicyProvider)
export class ResourcePolicyProvider implements PolicyProvider {

    @Value('malagu.security.policy')
    protected readonly policyMap?: { [resource: string]: (Policy[] | Policy) };

    protected readonly metadata = {
        [AuthorizeType.Pre]: new Map<string, Policy[]>(),
        [AuthorizeType.Post]: new Map<string, Policy[]>()
    };

    @PostConstruct()
    protected init(): void {
        if (this.policyMap) {
            for (const pattarn of Object.keys(this.policyMap)) {
                const temp = this.policyMap[pattarn];
                if (!temp) {
                    continue;
                }
                const policies = Array.isArray(temp) ? temp : [ temp ];

                for (const policy of policies) {
                    if (policy.authorizeType !== AuthorizeType.Post) {
                        policy.authorizeType = AuthorizeType.Pre;
                    }
                    const map = this.metadata[policy.authorizeType];
                    let ps = map.get(pattarn);
                    if (!ps) {
                        ps = [];
                        map.set(pattarn, ps);
                    }
                    ps.push(policy);
                }
            }
        }
    }

    async provide(ctx: PolicyContext): Promise<Policy[]> {
        const { resource, type } = ctx;
        const map = this.metadata[type];
        const policies: Policy[] = [];
        for (const pattarn of map.keys()) {
            if (contains(resource, pattarn)) {
                policies.push(...map.get(pattarn)!);
            }
        }
        return policies;
    }
}
