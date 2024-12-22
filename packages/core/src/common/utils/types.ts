export interface Newable<T> {
    new (...args: any[]): T;
}
export interface Abstract<T> {
    prototype: T;
}

export interface Type<T> extends Function {
    new (...args: any[]): T;
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * A byte array type that can be used to represent binary data.
 */
export type Bytes = string | ArrayBuffer | Uint8Array | Buffer | null | undefined;
