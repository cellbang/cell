import { Policy, ElPoliy, PolicyFactory, SECURITY_EXPRESSION_CONTEXT_KEY } from './access-protocol';
import { Component } from '@malagu/core';
import { Context } from '@malagu/core/lib/node';

@Component(PolicyFactory)
export class ElPolicyFactory implements PolicyFactory {
    async create(options: any): Promise<Policy> {
        const policy = new ElPoliy();
        policy.el = options.el;
        policy.context = Context.getAttr(SECURITY_EXPRESSION_CONTEXT_KEY);
        return policy;
    }

    async support(options: any): Promise<boolean> {
        return options.type === 'el';
    }
}
