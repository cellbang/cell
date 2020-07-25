import * as React from 'react';
import { View } from '@malagu/react';
import { LoginUserManager } from '@malagu/shell/lib/browser';
import { ContainerUtil } from '@malagu/core';

function Users() {
    const loginUserManager = ContainerUtil.get<LoginUserManager>(LoginUserManager);
    loginUserManager.userSubject.next({
        id: 'kevin',
        name: 'Kevin',
        avatar: '//s.gravatar.com/avatar/b7fb138d53ba0f573212ccce38a7c43b?s=80'
    });
    return (<div></div>);
}

@View({ component: Users})
export default class {}
