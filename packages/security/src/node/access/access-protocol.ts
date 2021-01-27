import { AuthorizeType, Policy } from '../../common';

export const AccessDecisionManager = Symbol('AccessDecisionManager');
export const AccessDecisionVoter = Symbol('AccessDecisionVoter');
export const SecurityMetadataSource = Symbol('SecurityMetadataSource');
export const PolicyResolver = Symbol('PolicyResolver');
export const SecurityExpressionContextHandler = Symbol('SecurityExpressionContextHandler');
export const PolicyProvider = Symbol('PolicyProvider');
export const PolicyFactory = Symbol('PolicyFactory');
export const ResourceNameResolver = Symbol('ResourceNameResolver');
export const ActionNameResolver = Symbol('ActionNameResolver');

export const SECURITY_EXPRESSION_CONTEXT_KEY = 'SecurityExpressionContext';

export const ACCESS_GRANTED = 1;
export const ACCESS_ABSTAIN = 0;
export const ACCESS_DENIED = -1;

export const TENANT_VOTER_PRIORITY = 2000;
export const POLICY_BASED_VOTER_PRIORITY = TENANT_VOTER_PRIORITY - 100;

export interface PolicyContext {
    principal: any;
    type: AuthorizeType;
    resource: string;
}

export interface PolicyProvider {
    provide(ctx: PolicyContext): Promise<Policy[]>;
}

export interface PolicyFactory {
    create(options: any): Promise<Policy>;
    support(options: any): Promise<boolean>;
}

export interface PolicyResolver {
    resolve(policy: Policy, securityMetadata: SecurityMetadata): Promise<number>;
    support(policy: Policy, securityMetadata: SecurityMetadata): Promise<boolean>;
}

export interface SecurityExpressionContextHandler {
    handle(context: any): Promise<void>
}

export interface SecurityMetadata {
    authorizeType: AuthorizeType;
    action: string;
    resource: string;
    principal: any;
    policies: Policy[];
    grant: number;
}

export interface SecurityMetadataContext {
}

export interface MethodSecurityMetadataContext extends SecurityMetadataContext {
    grant: number;
    authorizeType: AuthorizeType
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

export interface AccessDecisionVoter {
    vote(securityMetadata: SecurityMetadata): Promise<number>;
    support(securityMetadata: SecurityMetadata): Promise<boolean>;
    readonly priority: number;
}

export interface ResourceNameResolver {
    resolve(ctx: MethodSecurityMetadataContext): Promise<string[]>;
}

export interface ActionNameResolver {
    resolve(ctx: MethodSecurityMetadataContext): Promise<string>;
}
