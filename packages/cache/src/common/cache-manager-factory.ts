import { caching, StoreConfig, CacheOptions } from 'cache-manager';
import { CacheManager, CacheManagerFactory } from './cache-protocol';
import { Component, Value } from '@malagu/core';

@Component(CacheManagerFactory)
export class DefaultCacheManagerFactory implements CacheManagerFactory {

    @Value('malagu.cache.config')
    protected readonly cacheConfig: StoreConfig & CacheOptions | { [name: string]: StoreConfig & CacheOptions };

    create(name: string | undefined): CacheManager {
        if (name) {
            return caching(this.cacheConfig[name]);
        }
        return caching(this.cacheConfig as StoreConfig & CacheOptions);
    }

}
