import { MethodBeforeAdvice, Autowired, Component, AfterReturningAdvice } from '@malagu/core';
import { AccessDecisionManager, SecurityMetadataSource } from './access-protocol';
import { AuthorizeType } from '../annotation/authorize';

@Component(MethodBeforeAdvice)
export class SecurityMethodBeforeAdivice implements MethodBeforeAdvice {

    @Autowired(AccessDecisionManager)
    protected readonly accessDecisionManager: AccessDecisionManager;

    @Autowired(SecurityMetadataSource)
    protected readonly securityMetadataSource: SecurityMetadataSource;

    async before(method: string | number | symbol, args: any[], target: any): Promise<void> {
        if (typeof method !== 'string') {
            return;
        }
        const securityMetadata = await this.securityMetadataSource.load({ method, args, target, type: AuthorizeType.Pre });
        await this.accessDecisionManager.decide(securityMetadata);
    }

}

@Component(AfterReturningAdvice)
export class SecurityAfterReturningAdvice implements AfterReturningAdvice {

    @Autowired(AccessDecisionManager)
    protected readonly accessDecisionManager: AccessDecisionManager;

    @Autowired(SecurityMetadataSource)
    protected readonly securityMetadataSource: SecurityMetadataSource;

    async afterReturning(returnValue: any, method: string | number | symbol, args: any[], target: any): Promise<void> {
        if (typeof method !== 'string') {
            return;
        }
        const securityMetadata = await this.securityMetadataSource.load({ method, args, target, returnValue, type: AuthorizeType.Post });
        await this.accessDecisionManager.decide(securityMetadata);
    }

}
