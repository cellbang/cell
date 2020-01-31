export interface Newable<T> {
    new (...args: any[]): T;
}
export interface Abstract<T> {
    prototype: T;
}

export interface Type<T> extends Function {
    new (...args: any[]): T;
}
