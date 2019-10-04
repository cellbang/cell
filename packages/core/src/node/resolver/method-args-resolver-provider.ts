import { Component, Autowired, Prioritizeable } from '../../common';
import { MethodArgsResolver } from './resolver-protocol';

@Component()
export class MethodArgsResolverProvider {

    protected prioritized: MethodArgsResolver[];

    constructor(
        @Autowired(MethodArgsResolver)
        protected readonly methodArgsResolvers: MethodArgsResolver[]
    ) { }

    provide(): MethodArgsResolver[] {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.methodArgsResolvers).map(c => c.value);
        }
        return this.prioritized;
    }

}
