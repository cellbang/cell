import { Value, Component } from '@malagu/core';
import axios from 'axios';
import { UserService } from '@malagu/security/lib/node';
import { User } from '@malagu/security';

@Component({ id: UserService, rebind: true })
export class UserServiceImpl implements UserService<string, User> {

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
            policies: [],
            rawUserInfo: data
        } as any;
    }
}
