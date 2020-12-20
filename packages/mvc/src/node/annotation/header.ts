import { METADATA_KEY } from '../constants';

export interface RequestHeaderMetadata {
    name?: string;
    parameterIndex: number;
}

export interface ResponseHeaderMetadata {
    name: string;
    value: string;
}

export interface HeaderDecorator {
    (name?: string): ParameterDecorator;
    (name: string, value: string): MethodDecorator;

}

export const Header = <HeaderDecorator>function (name?: string, value?: string) {
    if (name && value) {
        return (t: any, tk: string | symbol, d: PropertyDescriptor) => {
            applyResponseHeaderDecorator(t, tk, d, name, value);
        };
    } else {
        return (t: any, tk: string | symbol, i: number) => {
            applyRequestHeaderDecorator(t, tk, i, name);
        };
    }
};

export function applyRequestHeaderDecorator(target: any, targetKey: string | symbol, parameterIndex: number, name?: string): void {
    const metadatas: RequestHeaderMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.controllerRequestHeader, target.constructor, targetKey) || [];
    metadatas.push({ name, parameterIndex });
    Reflect.defineMetadata(METADATA_KEY.controllerRequestHeader, metadatas, target.constructor, targetKey);
}

export function applyResponseHeaderDecorator(target: any, targetKey: string | symbol, descriptor: PropertyDescriptor, name: string, value: string): void {
    const metadatas: ResponseHeaderMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.controllerResponseHeader, target.constructor, targetKey) || [];
    metadatas.push({ name, value  });
    Reflect.defineMetadata(METADATA_KEY.controllerResponseHeader, metadatas, target.constructor, targetKey);
}
