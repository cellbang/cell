import { JWKS } from 'jose';
import { JwkSetManager } from './jwk-protocol';
import { Component, Autowired } from '@malagu/core';
import { RestOperations } from '@malagu/web/lib/common/client/client-protocol';

@Component(JwkSetManager)
export class DefaultJwkSetManager implements JwkSetManager<JWKS.KeyStore> {

    protected readonly cacheMap = new Map<string, JWKS.KeyStore>();

    @Autowired(RestOperations)
    protected readonly restOperations: RestOperations;

    async get(jwksUri: string): Promise<JWKS.KeyStore> {
        let keyStore = this.cacheMap.get(jwksUri);
        if (!keyStore) {
            const { data } = await this.restOperations.get(jwksUri);
            keyStore = JWKS.asKeyStore(data);
            this.cacheMap.set(jwksUri, keyStore);
        }
        return keyStore;
    }
}
