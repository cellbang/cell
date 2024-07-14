export const AccountProvider = Symbol('AccountProvider');

export interface Account {
    id: string;
}

export interface AccountProvider {
    provide(): Promise<Account | undefined>
}
