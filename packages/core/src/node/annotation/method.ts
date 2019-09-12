import { METADATA_KEY } from '../constants';
import { interfaces } from 'inversify';
import { Middleware } from '../middleware';

export type StrOrRegex = string | RegExp;
export type RouteOptions = StrOrRegex | { path: StrOrRegex } | { options: Object, path: StrOrRegex } & Object;

export interface MethodMetadata {
    options: RouteOptions;
    middleware: interfaces.ServiceIdentifier<Middleware>[];
    target: any;
    method: string;
    key: string;
    descriptor: TypedPropertyDescriptor<Function>;
}

export interface MethodDecorator {
    (
        method: string,
        options?: RouteOptions,
        ...middleware: interfaces.ServiceIdentifier<Middleware>[]
    ): (target: any, key: string, descriptor: TypedPropertyDescriptor<Function>) => void;
}

export interface HandlerDecorator {
    (target: any, key: string, descriptor: TypedPropertyDescriptor<Function>): void;
}

export function Get(options?: RouteOptions, ...middleware: interfaces.ServiceIdentifier<Middleware>[]): HandlerDecorator {
    return Method('get', options, ...middleware);
}

export function Post(options?: RouteOptions, ...middleware: interfaces.ServiceIdentifier<Middleware>[]): HandlerDecorator {
    return Method('post', options, ...middleware);
}

export function Put(options?: RouteOptions, ...middleware: interfaces.ServiceIdentifier<Middleware>[]): HandlerDecorator {
    return Method('put', options, ...middleware);
}

export function Patch(options?: RouteOptions, ...middleware: interfaces.ServiceIdentifier<Middleware>[]): HandlerDecorator {
    return Method('patch', options, ...middleware);
}

export function Head(options?: RouteOptions, ...middleware: interfaces.ServiceIdentifier<Middleware>[]): HandlerDecorator {
    return Method('head', options, ...middleware);
}

export function Delete(options?: RouteOptions, ...middleware: interfaces.ServiceIdentifier<Middleware>[]): HandlerDecorator {
    return Method('del', options, ...middleware);
}

export function Options(options?: RouteOptions, ...middleware: interfaces.ServiceIdentifier<Middleware>[]): HandlerDecorator {
    return Method('opts', options, ...middleware);
}

export const Method = <MethodDecorator>function (
    method: string,
    options: RouteOptions = '',
    ...middleware: interfaces.ServiceIdentifier<Middleware>[]
): HandlerDecorator {
    return function (target: any, key: string, descriptor: TypedPropertyDescriptor<Function>) {
        const metadata: MethodMetadata = { options, middleware, method, target, key, descriptor };
        let metadataList: MethodMetadata[] = [];

        if (!Reflect.hasOwnMetadata(METADATA_KEY.controllerMethod, target.constructor)) {
            Reflect.defineMetadata(METADATA_KEY.controllerMethod, metadataList, target.constructor);
        } else {
            metadataList = Reflect.getOwnMetadata(METADATA_KEY.controllerMethod, target.constructor);
        }
        metadataList.push(metadata);
    };
};
