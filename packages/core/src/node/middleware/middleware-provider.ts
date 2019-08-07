import { injectable, multiInject, optional } from 'inversify';
import { Context } from '../jsonrpc';
import { Prioritizeable } from '../../common/prioritizeable';

export const Middleware = Symbol('Middleware');

export interface Middleware {

    handle(ctx: Context, next: () => Promise<void>): Promise<void>;

    readonly priority: number;
}

@injectable()
export class MiddlewareProvider {

    protected prioritized: Middleware[];

    constructor(
        @multiInject(Middleware) @optional()
        protected readonly middlewares: Middleware[]
    ) { }

    provide(): Middleware[] {
        if (!this.prioritized) {
            this.prioritized = Prioritizeable.prioritizeAllSync(this.middlewares).map(c => c.value);
        }
        return this.prioritized;
    }

}
