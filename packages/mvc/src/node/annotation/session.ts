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
    (name?: string): (target: any, targetKey: string, parameterIndex: number) => any;
    (target: any, targetKey: string, parameterIndex: number): any;
    (name: string, value: string): (target: any, targetKey: string, descriptor: PropertyDescriptor) => any;

}

export const Session = <SessionDecorator>function (target: any, targetKey: string, parameterIndex: number) {
    if (parameterIndex !== undefined) {
        applyRequestSessionDecorator(target, targetKey, parameterIndex);
    } else if (target && targetKey) {
        return (t: any, tk: string, d: PropertyDescriptor) => {
            applyResponseSessionDecorator(t, tk, d, target, targetKey);
        };
    } else {
        return (t: any, tk: string, i: number) => {
            applyRequestSessionDecorator(t, tk, i, target);
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
