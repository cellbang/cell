import { Component } from '@malagu/core';
import { DefaultAccountProvider } from '@malagu/cloud/lib/node';
import { AccountProvider, Account } from '@malagu/cloud';

@Component({ id: AccountProvider, rebind: true })
export class FaaSAccountProvider extends DefaultAccountProvider {

    async provide(): Promise<Account | undefined> {
        const account = await super.provide();
        if (account) {
            return account;
        }
        return {
            id: process.env.ALIBABA_ACCOUNT_ID!
        };
    }

}
