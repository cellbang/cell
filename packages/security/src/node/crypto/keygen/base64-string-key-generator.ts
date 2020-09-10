import { StringKeyGenerator } from './keygen-protocol';
import { enc, lib } from 'crypto-js';
import { Value, Component } from '@malagu/core';

@Component([Base64StringKeyGenerator, StringKeyGenerator])
export class Base64StringKeyGenerator implements StringKeyGenerator {

    @Value('malagu.security.base64StringKeyLength')
    protected readonly keyLength: number;

    async generateKey(keyLength?: number) {
        const key = lib.WordArray.random(keyLength || this.keyLength);
        return enc.Base64.stringify(key);
    }
}
