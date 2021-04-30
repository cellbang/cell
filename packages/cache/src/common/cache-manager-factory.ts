import { caching, StoreConfig, CacheOptions } from 'cache-manager';
import { CacheManager, CacheManagerFactory, CacheStoreFactory } from './cache-protocol';
import { Component, Value, Autowired } from '@malagu/core';

@Component(CacheManagerFactory)
export class DefaultCacheManagerFactory implements CacheManagerFactory {

    @Value('malagu.cache.config')
    protected readonly cacheConfig: StoreConfig & CacheOptions | { [name: string]: StoreConfig & CacheOptions };

    @Autowired(CacheStoreFactory)
    protected readonly cacheStoreFactory: CacheStoreFactory;

    create(name: string | undefined): CacheManager {
        let config: StoreConfig & CacheOptions;
        if (name) {
            config = this.cacheConfig[name];
        } else {
            config = this.cacheConfig as StoreConfig & CacheOptions;
        }

        if (!config) {
            throw Error('Not found cache options.');
        }

        config.store = this.cacheStoreFactory.create(config);

        return caching(config);
    }

}
