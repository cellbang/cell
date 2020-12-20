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

export interface UserMapperRule {
    avatar: string;
    nickname: string;
    [key: string]: any;
}
