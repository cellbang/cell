import { Component, Autowired, Prioritizeable } from '@malagu/core';
import { LogoutSuccessHandler } from './logout-protocol';

@Component()
export class LogoutSuccessHandlerProvider {

    protected prioritized: LogoutSuccessHandler[];

    constructor(
        @Autowired(LogoutSuccessHandler)
        protected readonly logoutSuccessHandler: LogoutSuccessHandler[]
    ) { }

    provide(): LogoutSuccessHandler[] {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.logoutSuccessHandler).map(c => c.value);
        }
        return this.prioritized;
    }

}
