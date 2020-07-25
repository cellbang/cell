
export const CONTEXT = Symbol('CONTEXT');

export const ContextProvider = Symbol('ContextProvider');

export interface ContextProvider {
    provide(): React.ComponentType<any>[];
}
