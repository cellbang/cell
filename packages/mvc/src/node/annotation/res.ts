import { METADATA_KEY } from '../constants';

export interface ResponseMetadata {
    parameterIndex: number;
}

export function Res(): ParameterDecorator {
    return (t, tk, i) => {
        applyResponseDecorator(t, tk, i);
    };
}

export function applyResponseDecorator(target: any, targetKey: string | symbol | undefined, parameterIndex: number): void {
    if (!targetKey) {
        return;
    }
    Reflect.defineMetadata(
        METADATA_KEY.controllerResponse,
        { parameterIndex } as ResponseMetadata,
        target.constructor,
        targetKey
    );
}
