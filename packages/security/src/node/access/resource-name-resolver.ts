import { MethodSecurityMetadataContext, ResourceNameResolver } from './access-protocol';
import { Component } from '@malagu/core';

@Component(ResourceNameResolver)
export class DefaultResourceNameResolver implements ResourceNameResolver {

    async resolve(ctx: MethodSecurityMetadataContext): Promise<string> {
        return ctx.target.constructor.name;
    }
}
