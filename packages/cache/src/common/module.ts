import { autoBind } from '@malagu/core';
import { CacheManager, CacheManagerFactory } from './cache-protocol';
import '.';

export default autoBind(bind => {
    bind(CacheManager).toDynamicValue(ctx => {
        const factory = ctx.container.get<CacheManagerFactory>(CacheManagerFactory);
        return factory.create(ctx.currentRequest.target.getNamedTag()?.value);
    }).inSingletonScope();
});
