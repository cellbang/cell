import { METADATA_KEY } from '../constants';

export interface RequestMetadata {
    parameterIndex: number;
}

export function Request(): ParameterDecorator {
    return (t, tk, i) => {
        applyRequestDecorator(t, tk, i);
    };
}

export function applyRequestDecorator(target: any, targetKey: string | symbol, parameterIndex: number): void {
    Reflect.defineMetadata(
        METADATA_KEY.controllerRequest,
        { parameterIndex } as RequestMetadata,
        target.constructor,
        targetKey
    );
}
