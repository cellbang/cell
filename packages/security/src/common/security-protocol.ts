export enum AuthorizeType {
    Pre= 'Pre', Post= 'Post'
}

export enum PolicyType {
    El= 'el'
}

export interface Policy {
    type: PolicyType | string
    authorizeType: AuthorizeType;
    [key: string]: any;
}

export interface ElPolicy extends Policy {
    context: any;
    el: string;
}

export enum UserType {
    Memery = 'memory', Database = 'database'
}

export interface User {
    type: string;
    username: string;
    password: string;
    policies: Policy[];
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    enabled: boolean;
    claims?: { [key: string]: any};
    [key: string]: any;
}

export namespace User {
    export function is(user: Object | undefined): user is User {
        return !!user && 'type' in user && 'username' in user && 'password' in user &&
            'policies' in user && 'accountNonExpired' in user && 'accountNonLocked' in user &&
            'credentialsNonExpired' in user && 'enabled' in user;
    }
}

export interface UserMapperRule {
    avatar: string;
    nickname: string;
    [key: string]: any;
}
