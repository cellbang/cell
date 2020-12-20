import { METADATA_KEY } from '../constants';
import { HttpMethod } from '@malagu/web';

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
    return Method(HttpMethod.GET, options);
}

export function Post(options?: RouteOptions): MethodDecorator {
    return Method(HttpMethod.POST, options);
}

export function Put(options?: RouteOptions): MethodDecorator {
    return Method(HttpMethod.PUT, options);
}

export function Patch(options?: RouteOptions): MethodDecorator {
    return Method(HttpMethod.PATCH, options);
}

export function Head(options?: RouteOptions): MethodDecorator {
    return Method(HttpMethod.HEAD, options);
}

export function Delete(options?: RouteOptions): MethodDecorator {
    return Method(HttpMethod.DELETE, options);
}

export function Options(options?: RouteOptions): MethodDecorator {
    return Method(HttpMethod.OPTIONS, options);
}

export const Method = function (method: string, options: RouteOptions = ''): MethodDecorator {
    return function (target, key, descriptor) {
        const metadata: MethodMetadata = { options, method, target, key, descriptor };
        let metadataList: MethodMetadata[] = [];

        if (!Reflect.hasOwnMetadata(METADATA_KEY.controllerMethod, target.constructor)) {
            Reflect.defineMetadata(METADATA_KEY.controllerMethod, metadataList, target.constructor);
        } else {
            metadataList = Reflect.getOwnMetadata(METADATA_KEY.controllerMethod, target.constructor);
        }
        metadataList.push(metadata);
    };
};
