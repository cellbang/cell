import { MethodBeforeAdvice, Autowired, Aspect, AfterReturningAdvice, Value, ConfigUtil, Injectable } from '@celljs/core';
import { AccessDecisionManager, MethodSecurityMetadataContext, ResourceNameResolver, SecurityMetadataSource, SECURITY_EXPRESSION_CONTEXT_KEY } from './access-protocol';
import { AOP_POINTCUT } from '@celljs/web';
import { SecurityContext } from '../context';
import { AuthorizeType } from '../../common';
import { Context } from '@celljs/web/lib/node';

const pointcut = ConfigUtil.getRaw().cell.security.aop?.pointcut || AOP_POINTCUT;

@Injectable()
export abstract class AbstractSecurityMethodAdivice {

    @Autowired(AccessDecisionManager)
    protected readonly accessDecisionManager: AccessDecisionManager;

    @Autowired(SecurityMetadataSource)
    protected readonly securityMetadataSource: SecurityMetadataSource;

    @Autowired(ResourceNameResolver)
    protected readonly resourceNameResolver: ResourceNameResolver;

    @Value('cell.security.enabled')
    protected readonly enabled: boolean;

    protected needAccessDecision(method: string | number | symbol) {
        return this.enabled && typeof method === 'string' && SecurityContext.getCurrent();
    }
}

@Aspect({ id: MethodBeforeAdvice, pointcut })
export class SecurityMethodBeforeAdivice extends AbstractSecurityMethodAdivice implements MethodBeforeAdvice {

    async before(method: string | number | symbol, args: any[], target: any): Promise<void> {
        if (this.needAccessDecision(method)) {
            const ctx: MethodSecurityMetadataContext = { method: method as string, args, target, authorizeType: AuthorizeType.Pre, grant: 0 };
            const securityMetadata = await this.securityMetadataSource.load(ctx);
            const resouces = await this.resourceNameResolver.resolve(ctx);
            for (const resource of resouces) {
                securityMetadata.resource = resource;
                await this.accessDecisionManager.decide(securityMetadata);
            }
        }
    }

}

@Aspect({ id: AfterReturningAdvice, pointcut })
export class SecurityAfterReturningAdvice extends AbstractSecurityMethodAdivice implements AfterReturningAdvice {

    async afterReturning(returnValue: any, method: string | number | symbol, args: any[], target: any): Promise<void> {
        if (this.needAccessDecision(method)) {
            const oldCtx = Context.getAttr<MethodSecurityMetadataContext>(SECURITY_EXPRESSION_CONTEXT_KEY);
            const newCtx = { method: method as string, args, target, returnValue, authorizeType: AuthorizeType.Post, grant: oldCtx.grant };
            const securityMetadata = await this.securityMetadataSource.load(newCtx);
            const resouces = await this.resourceNameResolver.resolve(newCtx);
            for (const resource of resouces) {
                securityMetadata.resource = resource;
                await this.accessDecisionManager.decide(securityMetadata);
            }
        }
    }

}

