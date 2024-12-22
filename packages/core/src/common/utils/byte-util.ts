import { IllegalArgumentError } from '../error';
import { Bytes } from './types';

/**
 * Byte utility class.
 */
export class ByteUtil {
    private static isNode(): boolean {
        return typeof Buffer !== 'undefined';
    }

    private static isBrowser(): boolean {
        return typeof TextDecoder !== 'undefined';
    }

    static decode(bytes: Bytes): string {
        if (!bytes) {
            return '';
        }
        if (typeof bytes === 'string') {
            return bytes;
        }

        if (this.isNode()) {
            if (bytes instanceof Buffer || bytes instanceof Uint8Array) {
                return Buffer.from(bytes).toString('utf8');
            }
            throw new IllegalArgumentError(
                `Unexpected type ${bytes.constructor.name} in Node environment.`
            );
        }

        if (this.isBrowser()) {
            if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
                return new TextDecoder('utf8').decode(bytes);
            }
            throw new IllegalArgumentError(
                `Unexpected type ${(bytes as any).constructor.name} in Browser environment.`
            );
        }

        throw new IllegalArgumentError(
            'Neither Buffer nor TextDecoder are available.'
        );
    }

    static encodeBase64(bytes: Bytes): string {
        if (!bytes) {
            return '';
        }

        if (this.isNode()) {
            if (typeof bytes === 'string') {
                return Buffer.from(bytes, 'utf8').toString('base64');
            }
            if (bytes instanceof Buffer || bytes instanceof Uint8Array) {
                return Buffer.from(bytes).toString('base64');
            }
            throw new IllegalArgumentError(
                `Unexpected type ${bytes.constructor.name} in Node environment.`
            );
        }

        if (this.isBrowser()) {
            if (typeof bytes === 'string') {
                return btoa(new TextEncoder().encode(bytes).reduce((data, byte) => data + String.fromCharCode(byte), ''));
            }
            if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
                return btoa(String.fromCharCode(...new Uint8Array(bytes)));
            }
            throw new IllegalArgumentError(
                `Unexpected type ${(bytes as any).constructor.name} in Browser environment.`
            );
        }

        throw new IllegalArgumentError(
            'Neither Buffer nor TextEncoder are available.'
        );
    }
}
