import { METADATA_KEY } from '../constants';

export interface QueryMetadata {
    name?: string;
    parameterIndex: number;
}

export function Query(name?: string): ParameterDecorator {
    return (t, tk, i) => {
        applyQueryDecorator(t, tk, i, name);
    };
}

export function applyQueryDecorator(target: any, targetKey: string | symbol | undefined, parameterIndex: number, name?: string): void {
    if (!targetKey) {
        return;
    }
    const metadatas: QueryMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.controllerQuery, target.constructor, targetKey) || [];
    metadatas.push({ name, parameterIndex });
    Reflect.defineMetadata(METADATA_KEY.controllerQuery, metadatas, target.constructor, targetKey);
}
