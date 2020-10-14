export const ErrorConverter = Symbol('ErrorConverter');

export interface ErrorConverter {
    serialize(e: any): any;
    deserialize(e: any): any
}
