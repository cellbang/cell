import { METADATA_KEY } from '../constants';
import { HttpMethod } from '@celljs/http';

export type StrOrRegex = string | RegExp;
export type RouteOptions = StrOrRegex | { path: StrOrRegex } | { options: Object, path: StrOrRegex } & Object;

export interface MethodMetadata {
    options: RouteOptions;
    target: any;
    method: string;
    key: string | symbol;
    descriptor: TypedPropertyDescriptor<any>;
}

export function Get(options?: RouteOptions): MethodDecorator {
    return Method(options, HttpMethod.GET);
}

export function Post(options?: RouteOptions): MethodDecorator {
    return Method(options, HttpMethod.POST);
}

export function Put(options?: RouteOptions): MethodDecorator {
    return Method(options, HttpMethod.PUT);
}

export function Patch(options?: RouteOptions): MethodDecorator {
    return Method(options, HttpMethod.PATCH);
}

export function Head(options?: RouteOptions): MethodDecorator {
    return Method(options, HttpMethod.HEAD);
}

export function Delete(options?: RouteOptions): MethodDecorator {
    return Method(options, HttpMethod.DELETE);
}

export function Options(options?: RouteOptions): MethodDecorator {
    return Method(options, HttpMethod.OPTIONS);
}

export function All(options?: RouteOptions): MethodDecorator {
    return Method(options, HttpMethod.GET, HttpMethod.DELETE, HttpMethod.HEAD, HttpMethod.PATCH, HttpMethod.POST, HttpMethod.PUT, HttpMethod.TRACE, HttpMethod.OPTIONS);
}

export const Method = function (options: RouteOptions = '', ...methods: string[]): MethodDecorator {
    return function (target, key, descriptor) {
        let metadataList: MethodMetadata[] = [];

        if (!Reflect.hasOwnMetadata(METADATA_KEY.controllerMethod, target.constructor)) {
            Reflect.defineMetadata(METADATA_KEY.controllerMethod, metadataList, target.constructor);
        } else {
            metadataList = Reflect.getOwnMetadata(METADATA_KEY.controllerMethod, target.constructor);
        }
        for (const method of methods) {
            const metadata: MethodMetadata = { options, method, target, key, descriptor };
            metadataList.push(metadata);
        }
    };
};
