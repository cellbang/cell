import { AccessDecisionManager, SecurityMetadata, AccessDecisionVoter, ACCESS_DENIED, ACCESS_GRANTED } from './access-protocol';
import { Component, Prioritizeable, Autowired } from '@malagu/core';
import { AccessDeniedError } from '../error';

@Component(AccessDecisionManager)
export class AccessDecisionManagerImpl implements AccessDecisionManager {

    protected prioritized: AccessDecisionVoter[];

    constructor(
        @Autowired(AccessDecisionVoter)
        protected readonly accessDecisionVoters: AccessDecisionVoter[]
    ) {
        this.prioritized = Prioritizeable.prioritizeAllSync(this.accessDecisionVoters).map(c => c.value);
    }

    async decide(securityMetadata: SecurityMetadata): Promise<void> {
        let grant = 0;
        for (const voter of this.prioritized) {
            if (await voter.support(securityMetadata)) {
                const result = await voter.vote(securityMetadata);
                if (result === ACCESS_DENIED) {
                    throw new AccessDeniedError('Access is denied');
                } else if (result === ACCESS_GRANTED) {
                    grant++;
                }
            }
        }
        if (grant <= 0) {
            throw new AccessDeniedError('Access is denied');
        }
    }

}
