import { Component } from '@celljs/core';
import { DefaultAccountProvider } from '@celljs/cloud/lib/node';
import { AccountProvider, Account } from '@celljs/cloud';

@Component({ id: AccountProvider, rebind: true })
export class FaaSAccountProvider extends DefaultAccountProvider {

    override async provide(): Promise<Account | undefined> {
        const account = await super.provide();
        if (account) {
            return account;
        }
        return {
            id: process.env.ALIBABA_ACCOUNT_ID!
        };
    }

}
