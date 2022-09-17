import { ExpressionCompiler } from './expression-compiler';
import { ExpressionHandler } from './expression-handler';
import { ExpressionContext } from './expression-protocol';
import { JexlEngineProvider } from './jexl-engine-provider';

export class ExpressionHandlerFactory {

    create(ctx: ExpressionContext = {}): ExpressionHandler {
        const expressionHandler = new ExpressionHandler();
        const expressionCompiler = new ExpressionCompiler();
        const jexlEngineProvider = new JexlEngineProvider();
        expressionCompiler.jexlEngineProvider = jexlEngineProvider;
        expressionHandler.ctx = ctx;
        expressionHandler.expressionCompiler = expressionCompiler;
        const jexlEngine = jexlEngineProvider.provide();
        jexlEngine.addTransform('replace',
            (val: string, searchValue: string | RegExp, replaceValue: string) => val && val.replace(new RegExp(searchValue, 'g'), replaceValue));
        jexlEngine.addTransform('regexp', (pattern: string, flags?: string) => new RegExp(pattern, flags));
        jexlEngine.addTransform('toObjects', (arr: any[]) => arr?.map(item => ({ item })));
        jexlEngine.addTransform('suffix', (val: string | any[], suffix: string) => {
            let realVal = val;
            if (Array.isArray(val)) {
                realVal = val.shift()?.item;
            }
            return realVal ? `${realVal}${suffix}` : '';
        });
        jexlEngine.addTransform('prefix', (val: string | any[], prefix: string) => {
            let realVal = val;
            if (Array.isArray(val)) {
                realVal = val.shift()?.item;
            }
            return realVal ? `${prefix}${realVal}` : '';
        });

        jexlEngine.addTransform('eval', (text: string) => expressionHandler.evalSync(text, ctx));
        jexlEngine.addTransform('onTarget', (val: any, target: string) => ctx.currentTarget?.includes(target) ? val : undefined);
        jexlEngine.addTransform('onMode', (val: any, ...mode: string[]) => ctx.mode?.some((m: string) => mode?.includes(m)) ? val : undefined);
        return expressionHandler;

    }
}
