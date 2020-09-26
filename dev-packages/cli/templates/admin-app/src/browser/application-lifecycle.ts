import { ApplicationLifecycle, Component, Autowired } from '@malagu/core';
import { FrontendApplication } from '@malagu/core/lib/browser';
import { LoginUserManager } from '@malagu/shell/lib/browser';

@Component(ApplicationLifecycle)
export class ApplicationLifecycleImpl implements ApplicationLifecycle<FrontendApplication> {

    @Autowired(LoginUserManager)
    protected readonly loginUserManager: LoginUserManager;
    
    initialize?(): void {
        this.loginUserManager.userSubject.next({
            id: 'kevin',
            name: 'Kevin',
            avatar: '//s.gravatar.com/avatar/b7fb138d53ba0f573212ccce38a7c43b?s=80'
        });
    }

}