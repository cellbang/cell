import { Component, Autowired } from '../annotation';
import { JexlEngineProvider, ExpressionHandler, ExpressionContextProvider, ExpressionCompiler, ExpressionContext, ExpressionCompilerOptions } from './expression-protocol';
import * as traverse from 'traverse';

@Component(ExpressionHandler)
export class ExpressionHandlerImpl implements ExpressionHandler {

    @Autowired(JexlEngineProvider)
    protected readonly jexlEngineProvider: JexlEngineProvider<any>;

    @Autowired(ExpressionContextProvider)
    protected readonly expressionContextProvider: ExpressionContextProvider;

    @Autowired(ExpressionCompiler)
    protected readonly expressionCompiler: ExpressionCompiler;

    protected _ctx: ExpressionContext;

    protected getContext(ctx?: ExpressionContext, expressionCompilerOptions?: ExpressionCompilerOptions): ExpressionContext {
        const c = ctx || this.expressionContextProvider.provide();

        if (!ctx && c !== this._ctx && !expressionCompilerOptions?.ignoreContextExpression) {
            this._ctx = c;
            this.handle(c, c);
        }
        return c;
    }

    handle(textOrObj: string | Object, ctx?: ExpressionContext, expressionCompilerOptions?: ExpressionCompilerOptions): any {
        if (typeof textOrObj === 'string') {
            return this.doHandle(textOrObj, ctx, expressionCompilerOptions);
        } else {
            /* eslint-disable-next-line @typescript-eslint/no-this-alias */
            const self = this;
            traverse(textOrObj).forEach(function (value: any) {
                if (typeof value === 'string') {
                    this.update(self.handle(value, ctx, expressionCompilerOptions));
                } else if (value && (value as any)._ignoreEl === true) {
                    this.update(value, true);
                }
            });
            return textOrObj;
        }
    }

    protected doHandle(text: string, ctx?: ExpressionContext, expressionCompilerOptions?: ExpressionCompilerOptions): any {
        const sections = this.expressionCompiler.compileSections(text, expressionCompilerOptions);
        if (sections.length > 0) {
            if (this.hasExpression(sections)) {
                const c = this.getContext(ctx, expressionCompilerOptions);
                if (sections.length === 1) {
                    let value = sections[0].evalSync(c);
                    if (typeof value === 'string') {
                        value = this.handle(value, c);
                    }
                    return value;
                }
                const result: string[] = [];
                for (const section of sections) {
                    if (typeof section === 'string') {
                        result.push(section);
                    } else {
                        let value = section.evalSync(c);
                        if (typeof value === 'string') {
                            value = this.handle(value, c);
                        }
                        result.push(value);
                    }
                }
                return result.join('');
            }
        }
        return text;
    }

    protected hasExpression(sections: any[]) {
        for (const section of sections) {
            if (typeof section !== 'string') {
                return true;
            }
        }
        return false;
    }

}
