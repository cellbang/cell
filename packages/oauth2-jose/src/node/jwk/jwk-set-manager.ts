import { createRemoteJWKSet, FlattenedJWSInput, KeyLike } from 'jose';
import { JwkSetManager } from './jwk-protocol';
import { Component, Autowired } from '@malagu/core';
import { RestOperations } from '@malagu/web/lib/common/client/client-protocol';

@Component(JwkSetManager)
export class DefaultJwkSetManager implements JwkSetManager<KeyLike | Uint8Array> {

    protected readonly cacheMap = new Map<string, KeyLike | Uint8Array>();

    @Autowired(RestOperations)
    protected readonly restOperations: RestOperations;

    async get(jwksUri: string): Promise<KeyLike | Uint8Array> {
        let keyStore = this.cacheMap.get(jwksUri);
        if (!keyStore) {
            const { data } = await this.restOperations.get(jwksUri);
            const { alg, kid } = data.keys[0];
            const jwks = createRemoteJWKSet(new URL(jwksUri));
            keyStore = await jwks({ alg, kid }, <FlattenedJWSInput>{});
            this.cacheMap.set(jwksUri, keyStore);
        }
        return keyStore;
    }
}
