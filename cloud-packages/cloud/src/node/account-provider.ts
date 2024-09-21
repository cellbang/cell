import { Component, Value } from '@celljs/core';
import { AccountProvider, Account } from '../common';

@Component(AccountProvider)
export class DefaultAccountProvider implements AccountProvider {

    @Value('cell.cloud.account')
    protected readonly account: Account;

    async provide(): Promise<Account | undefined> {
        return this.account;
    }

}
