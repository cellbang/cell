import { Cache, Store } from 'cache-manager';

export const CacheManager = Symbol('CacheManager');
export const CacheManagerFactory = Symbol('CacheManagerFactory');
export const CacheStore = Symbol('CacheStore');
export const CacheStoreFactory = Symbol('CacheManagerFactory');

export const DEFAULT_CACHE_MANAGER = 'default';

export interface CacheManager extends Cache {

}

export interface CacheManagerFactory {
    create(name?: string): CacheManager;
}

export interface CacheStore extends Store {

}

export interface StoreConfig {
    [key: string]: any;
}

export interface CacheStoreFactory {
    create(config: StoreConfig): CacheStore;
}
