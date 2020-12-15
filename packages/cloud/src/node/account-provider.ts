import { Component, Value } from '@malagu/core';
import { AccountProvider, Account } from '../common';

@Component(AccountProvider)
export class DefaultAccountProvider implements AccountProvider {

    @Value('malagu.cloud.account')
    protected readonly account: Account;

    async provide(): Promise<Account | undefined> {
        return this.account;
    }

}
