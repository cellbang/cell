import { caching, multiCaching } from 'cache-manager';
import { CacheManager, CacheManagerFactory, CacheStoreFactory, CacheStoreFactoryConfig } from './cache-protocol';
import { Component, Value, Autowired } from '@malagu/core';
import { DelegatingCacheManager } from './delegating-cache-manager';

@Component(CacheManagerFactory)
export class DefaultCacheManagerFactory implements CacheManagerFactory {

    @Value('malagu.cache.config')
    protected readonly cacheConfig: { [name: string]: CacheStoreFactoryConfig };

    @Autowired(CacheStoreFactory)
    protected readonly cacheStoreFactory: CacheStoreFactory;

    protected async createMultiCacheManager(storesPromises: any[]): Promise<CacheManager> {
        const stores = await Promise.all(storesPromises);
        const caches = await Promise.all(stores.map(s => caching(() => s)));
        return new DelegatingCacheManager(Promise.resolve(multiCaching(caches)));
    }

    create(name: string = 'default'): CacheManager {
        const config = this.cacheConfig[name];

        if (!config) {
            throw Error('Not found cache options.');
        }

        const configs = Array.isArray(config) ? config : [config];

        const stores: any[] = [];

        for (const c of configs) {
            stores.push(this.cacheStoreFactory.create(c));

        }
        const cachePromise = stores.length === 1 ? caching<any>(() => stores[0]) : this.createMultiCacheManager(stores);
        return new DelegatingCacheManager(cachePromise);
    }

}
