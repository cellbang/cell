import { METADATA_KEY } from '../constants';

export interface RequestCookieMetadata {
    name?: string;
    parameterIndex: number;
}

export interface ResponseCookieMetadata {
    name: string;
    value: string;
}

export interface CookieDecorator {
    (name?: string): (target: any, targetKey: string, parameterIndex: number) => any;
    (target: any, targetKey: string, parameterIndex: number): any;
    (name: string, value: string): (target: any, targetKey: string, descriptor: PropertyDescriptor) => any;

}

export const Cookie = <CookieDecorator>function (target: any, targetKey: string, parameterIndex: number) {
    if (parameterIndex !== undefined) {
        applyRequestCookieDecorator(target, targetKey, parameterIndex);
    } else if (target && targetKey) {
        return (t: any, tk: string, d: PropertyDescriptor) => {
            applyResponseCookieDecorator(t, tk, d, target, targetKey);
        };
    } else {
        return (t: any, tk: string, i: number) => {
            applyRequestCookieDecorator(t, tk, i, target);
        };
    }
};

export function applyRequestCookieDecorator(target: any, targetKey: string | symbol, parameterIndex: number, name?: string): void {
    const metadatas: RequestCookieMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.controllerRequestCookie, target.constructor, targetKey) || [];
    metadatas.push({ name, parameterIndex });
    Reflect.defineMetadata(METADATA_KEY.controllerRequestCookie, metadatas, target.constructor, targetKey);
}

export function applyResponseCookieDecorator(target: any, targetKey: string | symbol, descriptor: PropertyDescriptor, name: string, value: string): void {
    const metadatas: ResponseCookieMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.controllerResponseCookie, target.constructor, targetKey) || [];
    metadatas.push({ name, value  });
    Reflect.defineMetadata(METADATA_KEY.controllerResponseCookie, metadatas, target.constructor, targetKey);
}
