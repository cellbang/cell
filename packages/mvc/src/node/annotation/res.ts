import { METADATA_KEY } from '../constants';

export interface ResponseMetadata {
    parameterIndex: number;
}

export function Res(): ParameterDecorator {
    return (t, tk, i) => {
        applyResponseDecorator(t, tk, i);
    };
}

export function applyResponseDecorator(target: any, targetKey: string | symbol, parameterIndex: number): void {
    Reflect.defineMetadata(
        METADATA_KEY.controllerResponse,
        { parameterIndex } as ResponseMetadata,
        target.constructor,
        targetKey
    );
}
