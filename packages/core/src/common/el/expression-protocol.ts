export const ExpressionCompiler = Symbol('ExpressionCompiler');
export const ExpressionHandler = Symbol('ExpressionHandler');
export const ContextInitializer = Symbol('ContextInitializer');
export const ExpressionContextProvider = Symbol('ExpressionContextProvider');
export const JexlEngineProvider = Symbol('JexlEngineProvider');

export interface ExpressionCompiler {
	compileSections(text: string): any[]
}

export interface ExpressionHandler {

    handle(text: string): any;

}

export interface ExpressionContext {
    [key: string]: any;
}

export interface ContextInitializer {

    initialize(ctx: ExpressionContext): void;
    readonly priority: number;
}

export interface ExpressionContextProvider {

    provide(): ExpressionContext;
}

export interface JexlEngineProvider {

    provide(): any
}

