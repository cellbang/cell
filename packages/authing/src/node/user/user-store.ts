import { Value, Component } from '@malagu/core';
import axios from 'axios';
import { UserStore, User, ElPolicy, PolicyType, AuthorizeType } from '@malagu/security/lib/node';

@Component({ id: UserStore, rebind: true })
export class UserStoreImpl implements UserStore {

    @Value('malagu.security')
    protected readonly options: any;

    @Value('malagu.authing')
    protected readonly authingOptions: any;

    async load(accessToken: string): Promise<User> {
        let data;
        let id;
        if (typeof accessToken === 'string') {
            const res = await axios.get(`https://users.authing.cn/oauth/oidc/user/userinfo?access_token=${accessToken}`);
            data = res.data;
            id = data.sub;
        } else {
            data = accessToken as any;
            id = data._id;
        }

        return {
            username: id,
            accountNonExpired: true,
            accountNonLocked: true,
            credentialsNonExpired: true,
            enabled: true,
            policies: [ <ElPolicy>{
                type: PolicyType.El,
                authorizeType: AuthorizeType.Pre,
                el: 'true'
            } ],
            rawUserInfo: data
        } as any;
    }
}
