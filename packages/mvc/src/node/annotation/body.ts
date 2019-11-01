import { METADATA_KEY } from '../constants';

export interface BodyMetadata {
    name?: string;
    parameterIndex: number;
}

export interface BodyDecorator {
    (name?: string): (target: any, targetKey: string, parameterIndex: number) => any;
    (target: any, targetKey: string, parameterIndex: number): any;
}

export const Body = <BodyDecorator>function (target: any, targetKey: string | symbol, parameterIndex: number) {
    if (targetKey === undefined) {
        return (t: any, tk: string, i: number) => {
            applyBodyDecorator(t, tk, i, target);
        };

    } else {
        applyBodyDecorator(target, targetKey, parameterIndex);
    }
};

export function applyBodyDecorator(target: any, targetKey: string | symbol, parameterIndex: number, name?: string): void {
    const metadatas: BodyMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.controllerBody, target.constructor, targetKey) || [];
    metadatas.push({ name, parameterIndex });
    Reflect.defineMetadata(METADATA_KEY.controllerBody, metadatas, target.constructor, targetKey);
}
