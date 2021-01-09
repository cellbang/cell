export const TenantProvider = Symbol('TenantProvider');

export interface TenantProvider {
    provide(tenant?: string): Promise<string>;
}
