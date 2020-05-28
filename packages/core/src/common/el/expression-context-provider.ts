import { Component, Autowired, Optional } from '../annotation';
import { ExpressionContextProvider, ContextInitializer, ExpressionContext } from './expression-protocol';
import { Prioritizeable } from '../utils';

@Component(ExpressionContextProvider)
export class ExpressionContextProviderImpl implements ExpressionContextProvider {

    protected prioritized: ContextInitializer[];
    protected ctx: ExpressionContext;
    protected initialized = false;

    constructor(
        @Autowired(ContextInitializer) @Optional
        protected readonly contextInitializers: ContextInitializer[]

    ) {
        this.ctx = process.env.MALAGU_CONFIG as any;
    }

    provide(): ExpressionContext {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.contextInitializers).map(c => c.value);
        }
        if (!this.initialized) {
            this.initialized = true;
            for (const initializer of this.prioritized) {
                initializer.initialize(this.ctx);
            }
        }
        return this.ctx;
    }

}
