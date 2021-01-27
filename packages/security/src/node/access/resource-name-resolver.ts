import { MethodSecurityMetadataContext, ResourceNameResolver } from './access-protocol';
import { Component, Value, Autowired, TenantProvider, TENANT_ENABLED, getOwnMetadata } from '@malagu/core';
import { METADATA_KEY } from '../constants';
import { evalSync } from 'jexl';

@Component(ResourceNameResolver)
export class DefaultResourceNameResolver implements ResourceNameResolver {

    @Value(TENANT_ENABLED)
    protected tenantEnabled: boolean;

    @Autowired(TenantProvider)
    protected tenantProvider: TenantProvider;

    async resolve(ctx: MethodSecurityMetadataContext): Promise<string[]> {
        const classResources: string[] = getOwnMetadata(METADATA_KEY.resource, ctx.target.constructor);
        const methodResources: string[] = getOwnMetadata(METADATA_KEY.resource, ctx.target.constructor, ctx.method);
        let resources: string[] = [];
        if (classResources.length && methodResources.length) {
            for (const resource of methodResources) {
                // eslint-disable-next-line no-eval
                resources.push(`${classResources[0]}:${evalSync(resource?.toString(), ctx)}`);
            }
        } else if (methodResources.length) {
            // eslint-disable-next-line no-eval
            resources = methodResources.map(r => evalSync(r?.toString(), ctx)?.toString());
        } else if (classResources.length) {
            resources = classResources;
        } else {
            resources = [ctx.target.constructor.name];
        }

        return this.appendTenantIfNeed(resources);
    }

    protected async appendTenantIfNeed(resources: string[]) {
        if (this.tenantEnabled) {
            const tenant = await this.tenantProvider.provide();
            return resources.map(r => `${tenant}:${r}`);
        }
        return resources;
    }
}
