import { AuthorizeType } from '../annotation/authorize';

export const AccessDecisionManager = Symbol('AccessDecisionManager');
export const AccessDecisionVoter = Symbol('AccessDecisionVoter');
export const SecurityMetadataSource = Symbol('SecurityMetadataSource');
export const PolicyResolver = Symbol('PolicyResolver');
export const SecurityExpressionContextHandler = Symbol('SecurityExpressionContextHandler');
export const ResourcePolicyProvider = Symbol('ResourcePolicyProvider');
export const PrincipalPolicyProvider = Symbol('PrincipalPolicyProvider');
export const PolicyFactory = Symbol('PolicyFactory');

export const SECURITY_EXPRESSION_CONTEXT_KEY = 'SecurityExpressionContext';

export const ACCESS_GRANTED = 1;
export const ACCESS_ABSTAIN = 0;
export const ACCESS_DENIED = -1;

export const POLICY_BASED_VOTER_PRIORITY = 2000;

export interface Policy {
    type: AuthorizeType;
}

export interface ResourcePolicyProvider {
    provide(resource: string, type: AuthorizeType): Promise<Policy[]>;
}

export interface PrincipalPolicyProvider {
    provide(principal: any, type: AuthorizeType): Promise<Policy[]>;
}

export interface PolicyFactory {
    create(options: any): Promise<Policy>;
    support(options: any): Promise<boolean>;
}

export interface PolicyResolver<> {
    resolve(policy: Policy, securityMetadata: SecurityMetadata): Promise<boolean>;
    support(policy: Policy): Promise<boolean>;
}

export class ElPoliy implements Policy {
    type: AuthorizeType;
    context: any;
    el: string;
}

export interface SecurityExpressionContextHandler {
    handle(context: any): Promise<void>
}

export interface SecurityMetadata {
    type: AuthorizeType;
    action: string;
    resource: string;
    principal: any;
    policies: Policy[];
}

export interface SecurityMetadataContext {
}

export interface MethodSecurityMetadataContext extends SecurityMetadataContext {
    type: AuthorizeType
    method: string;
    args: any[];
    target: any;
    returnValue?: any

}

export interface SecurityMetadataSource {
    load(context: SecurityMetadataContext): Promise<SecurityMetadata>;
}

export interface AccessDecisionManager {
    decide(securityMetadata: SecurityMetadata): Promise<void>;
}

export interface AccessDecisionManager {
    decide(securityMetadata: SecurityMetadata): Promise<void>;
}

export interface AccessDecisionVoter {
    vote(securityMetadata: SecurityMetadata): Promise<number>;
    support(securityMetadata: SecurityMetadata): Promise<boolean>;
    readonly priority: number;
}
