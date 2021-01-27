import { MethodSecurityMetadataContext, ActionNameResolver } from './access-protocol';
import { Component, getOwnMetadata } from '@malagu/core';
import { METADATA_KEY } from '../constants';

@Component(ActionNameResolver)
export class DefaultActionNameResolver implements ActionNameResolver {

    async resolve(ctx: MethodSecurityMetadataContext): Promise<string> {
        const classResources: string[] = getOwnMetadata(METADATA_KEY.resource, ctx.target.constructor);
        const actions: string[] = getOwnMetadata(METADATA_KEY.action, ctx.target.constructor, ctx.method);
        const action = actions.length ? actions[0] : ctx.method;
        if (classResources.length) {
            return `${classResources[0]}:${action}`;
        } else {
            return `${ctx.target.constructor.name}:${action}`;
        }

    }
}
