export const ExpressionCompiler = Symbol('ExpressionCompiler');
export const ExpressionHandler = Symbol('ExpressionHandler');
export const ContextInitializer = Symbol('ContextInitializer');
export const ExpressionContextProvider = Symbol('ExpressionContextProvider');
export const JexlEngineProvider = Symbol('JexlEngineProvider');

export interface ExpressionCompiler {
    compileSections(text: string, options?: ExpressionCompilerOptions): any[]
}

export interface ExpressionHandler {

    handle(text: string | Object, ctx?: ExpressionContext, expressionCompilerOptions?: ExpressionCompilerOptions): any;

}

export interface ExpressionContext {
    [key: string]: any;
}

export interface ExpressionCompilerOptions {
    escapeChar?: string;
    specialChar?: string;
    bracketBegin?: string;
    bracketEnd?: string;
    ignoreSpecialChar?: boolean;
}

export interface ContextInitializer {

    initialize(ctx: ExpressionContext): void;
    readonly priority: number;
}

export interface ExpressionContextProvider {

    provide(): ExpressionContext;
}

export interface JexlEngineProvider<T> {

    provide(): T
}

