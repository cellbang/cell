import { METADATA_KEY } from '../constants';

export interface RequestSessionMetadata {
    name?: string;
    parameterIndex: number;
}

export interface ResponseSessionMetadata {
    name: string;
    value: string;
}

export interface SessionDecorator {
    (name?: string): ParameterDecorator;
    (name: string, value: string): MethodDecorator;

}

export const Session = <SessionDecorator>function (name?: string, value?: string) {
    if (name && value) {
        return (t: any, tk: string | symbol, d: PropertyDescriptor) => {
            applyResponseSessionDecorator(t, tk, d, name, value);
        };
    } else {
        return (t: any, tk: string | symbol, i: number) => {
            applyRequestSessionDecorator(t, tk, i, name);
        };
    }
};

export function applyRequestSessionDecorator(target: any, targetKey: string | symbol, parameterIndex: number, name?: string): void {
    const metadatas: RequestSessionMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.controllerRequestSession, target.constructor, targetKey) || [];
    metadatas.push({ name, parameterIndex });
    Reflect.defineMetadata(METADATA_KEY.controllerRequestSession, metadatas, target.constructor, targetKey);
}

export function applyResponseSessionDecorator(target: any, targetKey: string | symbol, descriptor: PropertyDescriptor, name: string, value: string): void {
    const metadatas: ResponseSessionMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.controllerResponseSession, target.constructor, targetKey) || [];
    metadatas.push({ name, value  });
    Reflect.defineMetadata(METADATA_KEY.controllerResponseSession, metadatas, target.constructor, targetKey);
}
