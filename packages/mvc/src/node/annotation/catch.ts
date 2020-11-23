import { METADATA_KEY } from '../constants';
import { ErrorType } from '@malagu/core';

export interface CatchMetadata {
    errorTypes: ErrorType[];
    target: any;
    key: string | symbol;
    descriptor: TypedPropertyDescriptor<any>;
}

export function Catch(errorTypes: ErrorType | ErrorType[]): MethodDecorator {
    return (t, k, d) => {
        applyCatchDecorator(t, k, d, Array.isArray(errorTypes) ? errorTypes : [ errorTypes ]);
    };
};

export function applyCatchDecorator(target: any, key: string | symbol, descriptor: TypedPropertyDescriptor<any>, errorTypes: ErrorType[]): void {
    const metadata: CatchMetadata = { errorTypes, target, key, descriptor };
    let metadataList: CatchMetadata[] = [];

    if (!Reflect.hasOwnMetadata(METADATA_KEY.controllerCatch, target.constructor)) {
        Reflect.defineMetadata(METADATA_KEY.controllerCatch, metadataList, target.constructor);
    } else {
        metadataList = Reflect.getOwnMetadata(METADATA_KEY.controllerCatch, target.constructor);
    }
    metadataList.push(metadata);
}
