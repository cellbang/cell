import { autoBind } from '@malagu/core';
import { CacheManager, CacheManagerFactory } from './cache-protocol';
import '.';

const InnerCacheManager = Symbol('InnerCacheManager');

export default autoBind(bind => {
    bind(CacheManager).toDynamicValue(ctx => {
        const name = ctx.currentRequest.target.getNamedTag()?.value;
        let cacheManager: CacheManager | undefined;
        if (name) {
            try {
                cacheManager = ctx.container.getNamed<CacheManager>(InnerCacheManager, name);
            } catch (e) {
                // ignore
            }
        } else {
            try {
                cacheManager = ctx.container.get<CacheManager>(InnerCacheManager);
            } catch (e) {
                // ignore
            }
        }
        if (cacheManager) {
            return cacheManager;
        }

        const factory = ctx.container.get<CacheManagerFactory>(CacheManagerFactory);
        cacheManager = factory.create(name);
        if (name) {
            ctx.container.bind(InnerCacheManager).toConstantValue(cacheManager).whenTargetNamed(name);
        } else {
            ctx.container.bind(InnerCacheManager).toConstantValue(cacheManager);
        }
        return cacheManager;
    });
});
