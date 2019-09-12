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
    (name?: string): (target: any, targetKey: string, parameterIndex: number) => any;
    (target: any, targetKey: string, parameterIndex: number): any;
    (name: string, value: string): (target: any, targetKey: string, descriptor: PropertyDescriptor) => any;

}

export const Header = <HeaderDecorator>function (target: any, targetKey: string, parameterIndex: number) {
    if (parameterIndex !== undefined) {
        applyRequestHeaderDecorator(target, targetKey, parameterIndex);
    } else if (target && targetKey) {
        return (t: any, tk: string, d: PropertyDescriptor) => {
            applyResponseHeaderDecorator(t, tk, d, target, targetKey);
        };
    } else {
        return (t: any, tk: string, i: number) => {
            applyRequestHeaderDecorator(t, tk, i, target);
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
