export const StringKeyGenerator = Symbol('StringKeyGenerator');

export interface StringKeyGenerator {

    generateKey(keyLength?: number): Promise<string>;

}
