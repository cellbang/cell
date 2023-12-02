import { caching } from 'cache-manager';
import { CacheManager, CacheManagerFactory, CacheStoreFactory, CacheStoreFactoryConfig } from './cache-protocol';
import { Component, Value, Autowired } from '@malagu/core';
import { DelegatingCacheManager } from './delegating-cache-manager';

@Component(CacheManagerFactory)
export class DefaultCacheManagerFactory implements CacheManagerFactory {

    @Value('malagu.cache.config')
    protected readonly cacheConfig: { [name: string]: CacheStoreFactoryConfig };

    @Autowired(CacheStoreFactory)
    protected readonly cacheStoreFactory: CacheStoreFactory;

    create(name: string = 'default'): CacheManager {
        const config = this.cacheConfig[name];

        if (!config) {
            throw Error('Not found cache options.');
        }

        const store = this.cacheStoreFactory.create(config);

        return new DelegatingCacheManager(caching<any>(store));
    }

}
