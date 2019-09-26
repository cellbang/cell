import { PasswordEncoder } from './crypto-protocol';
import { PBKDF2, lib, enc} from 'crypto-js';
import { Value, Component } from '@malagu/core';

@Component(PasswordEncoder)
export class Pbkdf2PasswordEncoder implements PasswordEncoder {

    @Value('malagu.security.passwordEncoder')
    protected readonly options: any;

    async encode(rawPassword: string): Promise<string> {
        const { encodeHashAsBase64 } = this.options;
        const salt = lib.WordArray.random(8);
        const encoded = this.doEncode(rawPassword, salt);
        if (encodeHashAsBase64) {
            return enc.Base64.stringify(encoded);
        }
        return encoded;
    }

    protected doEncode(rawPassword: string, salt: string): string {
        const { secret } = this.options;
        return salt + PBKDF2(rawPassword, salt + secret, this.options).toString();
    }

    async matches(rawPassword: string, encodedPassword: string): Promise<boolean> {
        const digested = this.doDecode(encodedPassword);
        const salt = digested.substring(0, 8);
        return digested === this.doEncode(rawPassword, salt);
    }

    protected doDecode(encoded: string): string {
        const { encodeHashAsBase64 } = this.options;
        if (encodeHashAsBase64) {
            return enc.Base64.parse(encoded);
        }
        return encoded;
    }
}
