import { METADATA_KEY } from '../constants';
import { ErrorType } from '@malagu/core';

export interface CatchMetadata {
    errorTypes: ErrorType[];
    target: any;
    key: string;
    descriptor: TypedPropertyDescriptor<Function>;
}

export interface CatchDecorator {
    (errorTypes: ErrorType | ErrorType[]): MethodDecorator;
}

export const Catch = <CatchDecorator>function (errorTypes: ErrorType | ErrorType[]) {
    return (t: any, k: string, d: TypedPropertyDescriptor<Function>) => {
        applyCatchDecorator(t, k, d, Array.isArray(errorTypes) ? errorTypes : [ errorTypes ]);
    };
};

export function applyCatchDecorator(target: any, key: string, descriptor: TypedPropertyDescriptor<Function>, errorTypes: ErrorType[]): void {
    const metadata: CatchMetadata = { errorTypes, target, key, descriptor };
    let metadataList: CatchMetadata[] = [];

    if (!Reflect.hasOwnMetadata(METADATA_KEY.controllerCatch, target.constructor)) {
        Reflect.defineMetadata(METADATA_KEY.controllerCatch, metadataList, target.constructor);
    } else {
        metadataList = Reflect.getOwnMetadata(METADATA_KEY.controllerCatch, target.constructor);
    }
    metadataList.push(metadata);
}
