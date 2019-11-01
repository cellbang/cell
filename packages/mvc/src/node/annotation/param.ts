import { METADATA_KEY } from '../constants';

export interface ParamMetadata {
    name?: string;
    parameterIndex: number;
}

export interface ParamDecorator {
    (name?: string): (target: any, targetKey: string, parameterIndex: number) => any;
    (target: any, targetKey: string, parameterIndex: number): any;
}

export const Param = <ParamDecorator>function (target: any, targetKey: string | symbol, parameterIndex: number) {
    if (targetKey === undefined) {
        return (t: any, tk: string, i: number) => {
            applyParamDecorator(t, tk, i, target);
        };

    } else {
        applyParamDecorator(target, targetKey, parameterIndex);
    }
};

export function applyParamDecorator(target: any, targetKey: string | symbol, parameterIndex: number, name?: string): void {
    const metadatas: ParamMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.controllerParam, target.constructor, targetKey) || [];
    metadatas.push({ name, parameterIndex });
    Reflect.defineMetadata(METADATA_KEY.controllerParam, metadatas, target.constructor, targetKey);
}
