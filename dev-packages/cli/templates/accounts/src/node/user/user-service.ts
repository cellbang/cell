import { UserService, UsernameNotFoundError } from '@celljs/security/lib/node';
import { Value, Component, Autowired } from '@celljs/core';
import { User, UserType } from '@celljs/security';
import { UserRepository } from './user-protocol';

@Component({ id: UserService, rebind: true })
export class DatabaseUserService implements UserService<string, User> {

    @Value('cell.security')
    protected readonly options: any;

    @Autowired(UserRepository)
    protected userRepository: UserRepository;

    async load(username: string): Promise<User> {
        const userEntity = await this.userRepository.getByUsername(username);
        if (userEntity) {
            return {
                type: UserType.Database,
                username: userEntity.id + '',
                password: userEntity.password,
                login: userEntity.username,
                avatar: userEntity.picture,
                email: userEntity.email,
                nickname: userEntity.nickname,
                accountNonExpired: true,
                accountNonLocked: true,
                credentialsNonExpired: true,
                enabled: !userEntity.blocked,
                policies: []
            };
        }

        throw new UsernameNotFoundError(`Could not find: ${username}`);
    }
}
