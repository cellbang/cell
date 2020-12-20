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
    (name?: string): ParameterDecorator;
    (name: string, value: string): MethodDecorator;

}

export const Cookie = <CookieDecorator>function (name?: string, value?: string): ParameterDecorator | MethodDecorator {
    if (name && value) {
        return (t: any, tk: string | symbol, d: PropertyDescriptor) => {
            applyResponseCookieDecorator(t, tk, d, name, value);
        };
    } else {
        return (t: any, tk: string, i: number) => {
            applyRequestCookieDecorator(t, tk, i, name);
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
