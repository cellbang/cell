import { Component, Autowired } from '../annotation';
import { PipeTransform, PipeProvider } from './pipe-protocol';
import { Prioritizeable } from '../utils';

@Component(PipeProvider)
export class PipeProviderImpl implements PipeProvider {

    protected prioritized: PipeTransform[];

    constructor(
        @Autowired(PipeTransform)
        protected readonly pipes: PipeTransform[]
    ) { }

    provide(): PipeTransform[] {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.pipes).map(c => c.value);
        }
        return this.prioritized;
    }

}
