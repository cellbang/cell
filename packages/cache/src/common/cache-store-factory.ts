import { StoreConfig, CacheStore, CacheStoreFactory } from './cache-protocol';
import { Component } from '@malagu/core';

@Component(CacheStoreFactory)
export class DefaultCacheStoreFactory implements CacheStoreFactory {

    create(config: StoreConfig): CacheStore {

        if (typeof config.store === 'string') {
            return this.load(config.store).create(config);
        }

        if (typeof config.store === 'object') {
            if ('create' in config.store) {
                return config.store.create(config);
            } else {
                return config.store;
            }
        }
        throw new Error('Not found cache store factory.');
    }

    protected load(store: string) {
        // switch case to explicit require statements for webpack compatibility.
        try {
            switch (store) {
                case 'memory':
                    return require('cache-manager/lib/stores/memory.js');
                case 'redis':
                    return require('cache-manager-redis');
                case 'redis-store':
                    return require('cache-manager-redis-store');
                case 'ioredis':
                    return require('cache-manager-ioredis');
                case 'mongodb':
                    return require('cache-manager-mongodb');
                case 'mongoose':
                    return require('cache-manager-mongoose');
                case 'fs-binary':
                    return require('cache-manager-fs-binary');
                case 'fs-hash':
                    return require('cache-manager-fs-hash');
                case 'hazelcast':
                    return require('cache-manager-hazelcast');
                case 'memcached-store':
                    return require('cache-manager-memcached-store');
                case 'memory-store':
                    return require('cache-manager-memory-store');
                case 'none':
                    return require('cache-manager/lib/stores/none.js');
            }
        } catch (error) {
            throw error;
        }
    }

}
