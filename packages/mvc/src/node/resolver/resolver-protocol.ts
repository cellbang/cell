
export const MethodArgsResolver = Symbol('MethodArgsResolver');
export const ResponseResolver = Symbol('ResponseResolver');
export const ViewResolver = Symbol('ViewResolver');

export interface MethodArgsResolver {
    readonly priority: number;
    resolve(metadata: any, args: any[]): Promise<void>;
}

export interface ResponseResolver {
    readonly priority: number;
    resolve(metadata: any): Promise<void>;
}

export interface ViewResolver {
    resolve(metadata: any, model: any): Promise<void>;
}
