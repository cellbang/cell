import { Component, Autowired } from '@malagu/core';
import { PrincipalPolicyProvider, AuthorizeType, Policy } from '@malagu/security/lib/node';
import { AuthingProvider } from '../authentication';

export const AUTHING_POLICY_TYPE = 'authing';

@Component({ id: PrincipalPolicyProvider, rebind: true })
export class PrincipalPolicyProviderImpl implements PrincipalPolicyProvider {

    @Autowired(AuthingProvider)
    protected readonly authingProvider: AuthingProvider;

    async provide(principal: any, type: AuthorizeType): Promise<Policy[]> {
        const policies: Policy[] = (principal.policies || []).filter((p: any) => p.authorizeType === type);

        if (type === AuthorizeType.Pre && principal.username) {
            const auth = this.authingProvider.provide();
            const { rawList } = await auth.userPermissionList(principal.username);
            policies.push({
                type: AUTHING_POLICY_TYPE,
                authorizeType: AuthorizeType.Pre,
                permissionList: rawList || []
            });
        }
        return policies;
    }
}

