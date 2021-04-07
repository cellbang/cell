import { METADATA_KEY } from '../constants';

export interface ViewMetadata {
    viewName: string;
    metadata?: { [key: string]: any };
}

export function View(viewName: string, metadata?: { [key: string]: any }): MethodDecorator {
    return (t, k, d) => {
        applyViewDecorator(t, k, d, viewName, metadata);
    };
}

export function applyViewDecorator(target: any, targetKey: string | symbol, descriptor: TypedPropertyDescriptor<any>, viewName: string, metadata?: { [key: string]: any }): void {
    Reflect.defineMetadata(METADATA_KEY.controllerView, { viewName, metadata }, target.constructor, targetKey);
}
