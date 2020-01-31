import { Type } from '../utils';

export const PipeTransform = Symbol('PipeTransform');
export const PipeProvider = Symbol('PipeProvider');
export const PipeManager = Symbol('PipeManager');

export interface ArgumentMetadata {

    readonly argType?: Type<any>;

    readonly data?: string;
}

export interface MethodMetadata {

    readonly target: Type<any>;

    readonly method: string | symbol;
}

export interface PipeTransform<T = any, R = any> {
    readonly priority: number;
    transform(value: T, metadata: ArgumentMetadata): R;
}

export interface PipeProvider {
    provide(): PipeTransform[];
}

export interface PipeManager {
    apply(metadata: MethodMetadata, args: any[]): Promise<void>;
}
