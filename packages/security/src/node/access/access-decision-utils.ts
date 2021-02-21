import { ContainerUtil } from '@malagu/core';
import { AuthorizeType, Policy } from '../../common';
import { SecurityContext } from '../context';
import { AccessDecisionManager } from './access-protocol';

export namespace AccessDecisionUtils {
    export function decide(resource: string, action: string, policies: Policy[] = [], principal?: any) {
        const accessDecisionManager = ContainerUtil.get<AccessDecisionManager>(AccessDecisionManager);
        return accessDecisionManager.decide({
            authorizeType: AuthorizeType.Pre,
            action,
            resource,
            principal: principal || SecurityContext.getAuthentication().principal,
            policies,
            grant: 0
        });
    }
}
