import { injectable, multiInject } from 'inversify';
import { Prioritizeable } from '../../common/prioritizeable';
import { ProxyProvider, ProxyCreator } from './proxy-protocol';
import { JsonRpcProxy } from '../../common/jsonrpc/proxy-factory';

@injectable()
export class ProxyProviderImpl implements ProxyProvider {

    constructor(
        @multiInject(ProxyCreator)
        protected readonly proxyCreators: ProxyCreator[]
    ) { }

    provide<T extends object>(path: string, target?: object): JsonRpcProxy<T>  {
        return this.prioritize(path)[0].create(path, target);
    }

    protected prioritize(path: string): ProxyCreator[] {
        const prioritized = Prioritizeable.prioritizeAllSync(this.proxyCreators, client => {
            try {
                return client.support(path);
            } catch {
                return 0;
            }
        });
        return prioritized.map(p => p.value);
    }

}
