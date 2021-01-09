import { Cache } from 'cache-manager';

export const CacheManager = Symbol('CacheManager');
export const CacheManagerFactory = Symbol('CacheManagerFactory');

export const DEFAULT_CACHE_MANAGER = 'default';

export interface CacheManager extends Cache {

}

export interface CacheManagerFactory {
    create(name: string | undefined): CacheManager;
}
