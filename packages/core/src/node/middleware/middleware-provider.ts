import { Context } from '../context';
import { Prioritizeable } from '../../common/prioritizeable';
import { Component, Autowired, Optional } from '../../common/annotation';

export const Middleware = Symbol('Middleware');

export interface Middleware {

    handle(ctx: Context, next: () => Promise<void>): Promise<void>;

    readonly priority: number;
}

@Component()
export class MiddlewareProvider {

    protected prioritized: Middleware[];

    constructor(
        @Autowired(Middleware) @Optional
        protected readonly middlewares: Middleware[]
    ) { }

    provide(): Middleware[] {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.middlewares).map(c => c.value);
        }
        return this.prioritized;
    }

}
