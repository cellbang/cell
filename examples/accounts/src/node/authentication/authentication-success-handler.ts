import { Component, Autowired } from '@malagu/core';
import { User, UserType } from '@malagu/security';
import { Context } from '@malagu/web/lib/node';
import { AuthenticationSuccessHandler, Authentication, DefaultAuthenticationSuccessHandler } from '@malagu/security/lib/node';
import { ClientRegistrationManager } from '@malagu/oauth2-client/lib/node';
import { User as UserEntity, Identity  } from '../entity';
import { UserRepository } from '../user';
const requestIp = require('request-ip');

@Component({ id: AuthenticationSuccessHandler, rebind: true })
export class OAuth2AuthenticationSuccessHandler extends DefaultAuthenticationSuccessHandler {

    @Autowired(UserRepository)
    protected userRepository: UserRepository;

    @Autowired(ClientRegistrationManager)
    protected readonly clientRegistrationManager: ClientRegistrationManager;

    protected rebuildAuthentication(authentication: Authentication, userEntity: UserEntity) {
        authentication.name = userEntity.id + '';
        const principal = authentication.principal;
        principal.username = userEntity.id + '';
        principal.enabled = !!userEntity.blocked;
    }

    protected log(userEntity: UserEntity) {
        userEntity.loginsCount += 1;
        userEntity.lastLogin = new Date();
        userEntity.lastIp = requestIp.getClientIp(Context.getRequest());
        return this.userRepository.update(userEntity);
    }

    async onAuthenticationSuccess(authentication: Authentication): Promise<void> {

        const principal = authentication.principal;
        if (User.is(principal)) {
            if (principal.type !== UserType.Memery && principal.type !== UserType.Database) {
                let userEntity = await this.userRepository.getByConnectionAndIdentifier(principal.type, principal.username);
                if (!userEntity) {
                    if (principal.email) {
                        userEntity = await this.userRepository.getByEmail(principal.email);
                    }
                }
                if (!userEntity) {
                    const registration = await this.clientRegistrationManager.get(principal.type);
                    userEntity = new UserEntity();
                    userEntity.username = principal.login;
                    userEntity.email = principal.email;
                    userEntity.emailVerified = !!principal.email;
                    userEntity.picture = principal.avatar;
                    userEntity.blocked = false;
                    userEntity.loginsCount = 0;
                    userEntity.nickname = principal.nickname || principal.login;

                    const identity = new Identity();
                    identity.connection = registration!.registrationId;
                    identity.identifier = principal.username;
                    identity.isSocial = true;
                    identity.provider = registration!.provider;
                    userEntity = await this.userRepository.create(userEntity, identity);
                }
                this.rebuildAuthentication(authentication, userEntity);
                await this.log(userEntity);
            }
        }
        await super.onAuthenticationSuccess(authentication);
     }

}
