import { Context } from '../context';
import { Component, Autowired, Optional, Prioritizeable } from '../../common';

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
