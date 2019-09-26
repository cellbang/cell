import { Component, Autowired, Prioritizeable } from '@malagu/core';
import { AuthenticationProvider, AuthenticationManager, Authentication } from './authentication-protocol';
import { AccountStatusError, AuthenticationError } from '../error';
import { SecurityContext } from '../context';
import { postConstruct } from 'inversify';

@Component(AuthenticationManager)
export class AuthenticationManagerImpl implements AuthenticationManager {

    protected prioritized: AuthenticationProvider[];

    @Autowired(AuthenticationProvider)
    protected readonly authenticationProviders: AuthenticationProvider[];

    @postConstruct()
    async init() {
        this.prioritized = Prioritizeable.prioritizeAllSync(this.authenticationProviders).map(c => c.value);
    }

    async authenticate(): Promise<void> {
        let result: Authentication | undefined;
        let lastError: any;
        for (const authenticationProvider of this.prioritized) {
            try {
                if (await authenticationProvider.support()) {
                    result = await authenticationProvider.authenticate();
                    if (result) {
                        SecurityContext.setAuthentication(result);
                        return;
                    }
                }
            } catch (error) {
                if (error instanceof AccountStatusError) {
                    throw error;
                } else if (error instanceof AuthenticationError) {
                    lastError = error;
                }
            }
        }
        if (lastError) {
           throw lastError;
        }
    }
}
