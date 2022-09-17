import * as traverse from 'traverse';
import { ExpressionCompiler } from './expression-compiler';
import { ExpressionContext } from './expression-protocol';

export class ExpressionHandler {

    expressionCompiler: ExpressionCompiler;
    ctx: ExpressionContext = {};

    handle(textOrObj: string | Object, ctx?: ExpressionContext) {
        const self = this;
        if (typeof textOrObj === 'string') {
            return this.evalSync(textOrObj, ctx || {});
        } else {
            traverse(textOrObj).forEach(function (value: any) {
                if (typeof value === 'string') {
                    this.update(self.evalSync(value, ctx || self.ctx || textOrObj));
                } else if (value && value._ignoreEl === true) {
                    this.update(value, true);
                }
            });
        }
    }

    evalSync(text: string, ctx: ExpressionContext): any {
        const sections = this.expressionCompiler.compileSections(text);
        if (sections.length > 0) {
            if (this.hasExpression(sections)) {
                if (sections.length === 1) {
                    let value = sections[0].evalSync(ctx);
                    if (typeof value === 'string') {
                        value = this.evalSync(value, ctx);
                    }
                    return value;
                }
                const result: string[] = [];
                for (const section of sections) {
                    if (typeof section === 'string') {
                        result.push(section);
                    } else {
                        let value = section.evalSync(ctx);
                        if (typeof value === 'string') {
                            value = this.evalSync(value, ctx);
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
