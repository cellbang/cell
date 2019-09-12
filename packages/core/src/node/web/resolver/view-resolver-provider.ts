import { Component, Autowired } from '../../../common/annotation';
import { ViewResolver } from './resolver-protocol';
import { Prioritizeable } from '../../../common/prioritizeable';

@Component()
export class ViewResolverProvider {

    protected prioritized: ViewResolver[];

    constructor(
        @Autowired(ViewResolver)
        protected readonly viewResolvers: ViewResolver[]
    ) { }

    provide(): ViewResolver[] {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.viewResolvers).map(c => c.value);
        }
        return this.prioritized;
    }

}
