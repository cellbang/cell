import { METADATA_KEY } from '../constants';

export interface BodyMetadata {
    name?: string;
    parameterIndex: number;
}

export function Body(name?: string): ParameterDecorator {
    return (t, tk, i) => {
        applyBodyDecorator(t, tk, i, name);
    };
}

export function applyBodyDecorator(target: any, targetKey: string | symbol | undefined , parameterIndex: number, name?: string): void {
    if (!targetKey) {
        return;
    }
    const metadatas: BodyMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.controllerBody, target.constructor, targetKey) || [];
    metadatas.push({ name, parameterIndex });
    Reflect.defineMetadata(METADATA_KEY.controllerBody, metadatas, target.constructor, targetKey);
}
