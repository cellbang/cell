import { METADATA_KEY } from '../constants';

export interface ParamMetadata {
    name?: string;
    parameterIndex: number;
}

export function Param(name?: string): ParameterDecorator {
    return (t, tk, i) => {
        applyParamDecorator(t, tk, i, name);
    };
}

export function applyParamDecorator(target: any, targetKey: string | symbol | undefined, parameterIndex: number, name?: string): void {
    if (!targetKey) {
        return;
    }
    const metadatas: ParamMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.controllerParam, target.constructor, targetKey) || [];
    metadatas.push({ name, parameterIndex });
    Reflect.defineMetadata(METADATA_KEY.controllerParam, metadatas, target.constructor, targetKey);
}
