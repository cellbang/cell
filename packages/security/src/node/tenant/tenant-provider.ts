import { TenantProvider } from '@malagu/core';
import { Component } from '@malagu/core';
import { SecurityContext } from '../context';

@Component(TenantProvider)
export class DefaultTenantProvider implements TenantProvider {
    async provide(tenant?: string): Promise<string> {
        return tenant || SecurityContext.getAuthentication().name;
    }
}
