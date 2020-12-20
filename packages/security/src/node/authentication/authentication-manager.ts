import { Component, Autowired, Prioritizeable } from '@malagu/core';
import { AuthenticationProvider, AuthenticationManager, Authentication, AuthenticationSuccessHandler } from './authentication-protocol';
import { AccountStatusError, AuthenticationError } from '../error';
import { SecurityContext } from '../context';
import { postConstruct } from 'inversify';

@Component(AuthenticationManager)
export class AuthenticationManagerImpl implements AuthenticationManager {

    protected prioritized: AuthenticationProvider[];

    @Autowired(AuthenticationProvider)
    protected readonly authenticationProviders: AuthenticationProvider[];

    @Autowired(AuthenticationSuccessHandler)
    protected readonly authenticationSuccessHandler: AuthenticationSuccessHandler;

    @postConstruct()
    async init() {
        this.prioritized = Prioritizeable.prioritizeAllSync(this.authenticationProviders).map(c => c.value);
    }

    async authenticate(next: () => Promise<void>): Promise<void> {
        let result: Authentication | undefined;
        let lastError: any;
        for (const authenticationProvider of this.prioritized) {
            try {
                if (await authenticationProvider.support()) {
                    result = await authenticationProvider.authenticate();
                    if (result) {
                        await this.authenticationSuccessHandler.onAuthenticationSuccess(result);
                        SecurityContext.setAuthentication(result);
                        if (result.next) {
                            await next();
                        }
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

    async support(): Promise<boolean> {
        for (const authenticationProvider of this.prioritized) {
            if (await authenticationProvider.support()) {
                return true;
            }
        }
        return false;
    }
}
