import { Component, Autowired } from '@malagu/core';
import { PolicyProvider, PolicyContext } from '@malagu/security/lib/node';
import { AuthorizeType, Policy } from '@malagu/security';
import { AuthingProvider } from '../authentication';

export const AUTHING_POLICY_TYPE = 'authing';

@Component(PolicyProvider)
export class PrincipalPolicyProvider implements PolicyProvider {

    @Autowired(AuthingProvider)
    protected readonly authingProvider: AuthingProvider;

    async provide(ctx: PolicyContext): Promise<Policy[]> {
        const { principal, type } = ctx;
        const policies: Policy[] = [];
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

