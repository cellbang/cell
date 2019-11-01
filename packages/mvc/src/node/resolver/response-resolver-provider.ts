import { Component, Autowired, Prioritizeable } from '@malagu/core';
import { ResponseResolver } from './resolver-protocol';

@Component()
export class ResponseResolverProvider {

    protected prioritized: ResponseResolver[];

    constructor(
        @Autowired(ResponseResolver)
        protected readonly responseResolvers: ResponseResolver[]
    ) { }

    provide(): ResponseResolver[] {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.responseResolvers).map(c => c.value);
        }
        return this.prioritized;
    }

}
