import { Component, Autowired, Prioritizeable } from '@malagu/core';
import { ContextProvider, CONTEXT } from './context-protocol';

@Component(ContextProvider)
export class ContextProviderImpl implements ContextProvider {

    protected prioritized: React.ComponentType[];

    constructor(
        @Autowired(CONTEXT)
        protected readonly contexts: React.ComponentType[]
    ) { }

    provide(): React.ComponentType<any>[] {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.contexts).map(c => c.value);
        }
        return this.prioritized;
    }

}
