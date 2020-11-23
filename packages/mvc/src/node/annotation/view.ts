import { METADATA_KEY } from '../constants';

export interface ViewMetadata {
    viewName: string;
}

export function View(viewName: string): MethodDecorator {
    return (t, k, d) => {
        applyViewDecorator(t, k, d, viewName);
    };
};

export function applyViewDecorator(target: any, targetKey: string | symbol, descriptor: TypedPropertyDescriptor<any>, viewName: string): void {
    Reflect.defineMetadata(METADATA_KEY.controllerView, { viewName }, target.constructor, targetKey);
}
