import { METADATA_KEY } from '../constants';

export interface ViewMetadata {
    viewName: string;
}

export interface ViewDecorator {
    (viewName: string): (target: any, key: string, descriptor: TypedPropertyDescriptor<Function>) => void;
}

export const View = <ViewDecorator>function (viewName: string) {
    return (t: any, k: string, d: TypedPropertyDescriptor<Function>) => {
        applyViewDecorator(t, k, d, viewName);
    };
};

export function applyViewDecorator(target: any, targetKey: string, descriptor: TypedPropertyDescriptor<Function>, viewName: string): void {
    Reflect.defineMetadata(METADATA_KEY.controllerView, { viewName }, target.constructor, targetKey);
}
