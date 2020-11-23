import { PrincipalPolicyProvider, ResourcePolicyProvider } from './access-protocol';
import { Component, Value, PostConstruct } from '@malagu/core';
import { AuthorizeType, Policy } from '../../common';
import * as UrlPattern from 'url-pattern';

@Component(PrincipalPolicyProvider)
export class PrincipalPolicyProviderImpl implements PrincipalPolicyProvider {

    async provide(principal: any, type: AuthorizeType): Promise<Policy[]> {
        const policies: Policy[] = principal && principal.policies || [];
        return policies.filter(p => p.authorizeType === type);
    }
}

@Component(ResourcePolicyProvider)
export class ResourcePolicyProviderImpl implements ResourcePolicyProvider {

    @Value('malagu.security.policy')
    protected readonly policyMap?: { [resource: string]: (Policy[] | Policy) };

    protected readonly metadata = {
        [AuthorizeType.Pre]: new Map<string, Policy[]>(),
        [AuthorizeType.Post]: new Map<string, Policy[]>()
    };

    @PostConstruct()
    protected async init(): Promise<void> {
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

    async provide(resource: string, type: AuthorizeType): Promise<Policy[]> {
        const map = this.metadata[type];
        const policies: Policy[] = [];
        for (const pattarn of map.keys()) {
            const result = new UrlPattern(pattarn).match(resource);
            if (result) {
                policies.push(...map.get(pattarn));
            }
        }
        return policies;
    }
}
