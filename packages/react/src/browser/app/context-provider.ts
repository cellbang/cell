import { Component, Autowired, Prioritizeable } from '@malagu/core';
import { ContextProvider, Context } from './app-protocol';

@Component(ContextProvider)
export class ContextProviderImpl implements ContextProvider {

    protected prioritized: (new() => Context)[];

    constructor(
        @Autowired(Context)
        protected readonly contexts: (new() => Context)[]
    ) { }

    async provide(): Promise<(new() => Context)[]> {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.contexts).map(c => c.value);
        }
        return this.prioritized;
    }

}
