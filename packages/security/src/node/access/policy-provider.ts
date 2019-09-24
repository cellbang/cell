import { Policy, PrincipalPolicyProvider, ResourcePolicyProvider, PolicyFactory } from './access-protocol';
import { Component, Value, Autowired } from '@malagu/core';
import { postConstruct } from 'inversify';
import { AuthorizeType } from '../annotation';

@Component(PrincipalPolicyProvider)
export class PrincipalPolicyProviderImpl implements PrincipalPolicyProvider {

    async provide(principal: any, type: AuthorizeType): Promise<Policy[]> {
        const policies: Policy[] = principal && principal.policies || [];
        return policies.filter(p => p.type === type);
    }
}

@Component(ResourcePolicyProvider)
export class ResourcePolicyProviderImpl implements ResourcePolicyProvider {

    @Value('malagu.security.policies')
    protected readonly policies?: any;

    protected readonly policyMap: Map<string, Map<string, Policy[]>> = new Map<string, Map<string, Policy[]>>();

    @Autowired(PolicyFactory)
    protected readonly policyFactories: PolicyFactory[];

    @postConstruct()
    protected async init(): Promise<void> {
        if (this.policies) {
            for (const resource of Object.keys(this.policies)) {
                for (const options of this.policies[resource]) {
                    let opts = options;
                    if (!Array.isArray(options)) {
                        opts = [ options ];
                    }
                    const preResult: Policy[] = [];
                    const postResult: Policy[] = [];
                    const result = new Map<string, Policy[]>();
                    for (const opt of opts) {
                        for (const factory of this.policyFactories) {
                            if (await factory.support(opt)) {
                                if (!opt.type || opt.type === AuthorizeType.Pre) {
                                    preResult.push(await factory.create(opt));
                                } else if (opt.type === AuthorizeType.Post) {
                                    postResult.push(await factory.create(opt));
                                }
                                result.set(AuthorizeType.Pre, preResult);
                                result.set(AuthorizeType.Post, postResult);
                                break;
                            }
                        }
                    }
                    this.policyMap.set(resource, result);
                }
            }
        }
    }

    async provide(resource: string, type: AuthorizeType): Promise<Policy[]> {
        const result = this.policyMap.get(resource);
        return result && result.get(type) || [];
    }
}
