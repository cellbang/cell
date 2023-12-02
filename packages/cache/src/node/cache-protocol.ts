import { Cache, Store, CachingConfig as InnerCachingConfig } from 'cache-manager';
export const CacheManager = Symbol('CacheManager');
export const CacheManagerFactory = Symbol('CacheManagerFactory');
export const CacheStore = Symbol('CacheStore');
export const CacheStoreFactory = Symbol('CacheManagerFactory');

export type CachingConfig = InnerCachingConfig<any>;

export const DEFAULT_CACHE_MANAGER = 'default';

export interface CacheManager extends Omit<Cache, 'store'> {
    store: Promise<Store>;
}

export interface CacheManagerFactory {
    create(name?: string): CacheManager;
}

export interface CacheStore extends Store {

}

export type CacheStoreFactoryConfig = CachingConfig & {
    store: string | Function | Object;
};

export interface CacheStoreFactory {
    create<T>(config: CacheStoreFactoryConfig): CacheStore;
}
