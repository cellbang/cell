import { METADATA_KEY } from '../constants';

export interface QueryMetadata {
    name?: string;
    parameterIndex: number;
}

export interface QueryDecorator {
    (name?: string): (target: any, targetKey: string, parameterIndex: number) => any;
    (target: any, targetKey: string, parameterIndex: number): any;
}

export const Query = <QueryDecorator>function (target: any, targetKey: string | symbol, parameterIndex: number) {
    if (targetKey === undefined) {
        return (t: any, tk: string, i: number) => {
            applyQueryDecorator(t, tk, i, target);
        };

    } else {
        applyQueryDecorator(target, targetKey, parameterIndex);
    }
};

export function applyQueryDecorator(target: any, targetKey: string | symbol, parameterIndex: number, name?: string): void {
    const metadatas: QueryMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.controllerQuery, target.constructor, targetKey) || [];
    metadatas.push({ name, parameterIndex });
    Reflect.defineMetadata(METADATA_KEY.controllerQuery, metadatas, target.constructor, targetKey);
}
