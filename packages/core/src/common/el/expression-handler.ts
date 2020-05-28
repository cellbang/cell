import { Component, Autowired } from '../annotation';
import { JexlEngineProvider, ExpressionHandler, ExpressionContextProvider, ExpressionCompiler, ExpressionContext } from './expression-protocol';
import * as traverse from 'traverse';
import { postConstruct } from 'inversify';

@Component(ExpressionHandler)
export class ExpressionHandlerImpl implements ExpressionHandler {

    @Autowired(JexlEngineProvider)
    protected readonly jexlEngineProvider: JexlEngineProvider;

    @Autowired(ExpressionContextProvider)
    protected readonly expressionContextProvider: ExpressionContextProvider;

    @Autowired(ExpressionCompiler)
    protected readonly expressionCompiler: ExpressionCompiler;

    protected _ctx: ExpressionContext;

    @postConstruct()
    protected init() {

    }

    protected getContext(ctx?: ExpressionContext) {
        const c = ctx || this.expressionContextProvider.provide();

        if (!ctx && c !== this._ctx) {
            this._ctx = c;
            const self = this;
            traverse(c).forEach(function (value: any) {
                if (typeof value === 'string') {
                    this.update(self.handle(value, c));
                }
            });
        }
        return c;
    }

    handle(text: string, ctx?: ExpressionContext): any {
        const sections = this.expressionCompiler.compileSections(text);
        if (sections.length > 0) {
            if (this.hasExpression(sections)) {
                const c = this.getContext(ctx);
                if (sections.length === 1) {
                    return sections[0].evalSync(this.expressionContextProvider.provide());
                }
                const result: string[] = [];
                for (const section of sections) {
                    if (typeof section === 'string') {
                        result.push(section);
                    } else {
                        result.push(section.evalSync(c));
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
