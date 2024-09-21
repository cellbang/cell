import { Component, Value } from '@celljs/core';
import { PrivateKeyNotFoundError, PublicKeyNotFoundError } from './errors';
import { JwtOptions, JwtSecretService, Secret } from './jwt-protocol';

@Component(JwtSecretService)
export class jwtSecretService implements JwtSecretService {

    @Value('cell.jwt')
    protected readonly jwtOptions?: JwtOptions;

    async getPublicKey(): Promise<string | Buffer> {
        const secret = this.jwtOptions?.publicKey ?? this.jwtOptions?.secret;
        if (secret) {
            return secret;
        }
        throw new PublicKeyNotFoundError();
    }

    async getPrivateKey(): Promise<Secret> {
        const secret = this.jwtOptions?.privateKey ?? this.jwtOptions?.secret;
        if (secret) {
            return secret;
        }
        throw new PrivateKeyNotFoundError();
    }
}
