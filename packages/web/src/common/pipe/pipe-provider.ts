import { Component, Autowired, Optional, Prioritizeable } from '@malagu/core';
import { PipeTransform, PipeProvider } from './pipe-protocol';

@Component(PipeProvider)
export class PipeProviderImpl implements PipeProvider {

    protected prioritized: PipeTransform[];

    constructor(
        @Autowired(PipeTransform) @Optional()
        protected readonly pipes: PipeTransform[]
    ) { }

    provide(): PipeTransform[] {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.pipes).map(c => c.value);
        }
        return this.prioritized;
    }

}
