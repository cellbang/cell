import { Store } from 'cache-manager';
import { CacheManager } from './cache-protocol';

export class DelegatingCacheManager implements CacheManager {

    store: Promise<Store>;

    constructor(protected readonly delegate: Promise<CacheManager>) {
        this.store = (async () => (await this.delegate).store)();
    }

    async set(key: string, value: unknown, ttl?: number | undefined): Promise<void> {
        return (await this.delegate).set(key, value, ttl);
    }

    async get<T>(key: string): Promise<T | undefined> {
        return (await this.delegate).get(key);
    }
    async del(key: string): Promise<void> {
        return (await this.delegate).del(key);
    }
    async reset(): Promise<void> {
        return (await this.delegate).reset();
    }
    async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number | undefined): Promise<T> {
        return (await this.delegate).wrap(key, fn, ttl);
    }
}
