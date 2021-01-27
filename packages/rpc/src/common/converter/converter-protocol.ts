export const ErrorConverter = Symbol('ErrorConverter');

export const GlobalConverter = Symbol('GlobalConverter');

export interface ErrorConverter {
    serialize(e: any): any;
    deserialize(e: any): any
}
