import { Component, Autowired } from '../annotation';
import { ContainerUtil } from '../container';
import { ContextInitializer, ExpressionContext, JexlEngineProvider, ExpressionHandler } from './expression-protocol';

@Component(ContextInitializer)
export class CoreContextInitializer implements ContextInitializer {

    @Autowired(JexlEngineProvider)
    protected readonly jexlEngineProvider: JexlEngineProvider<any>;

    initialize(ctx: ExpressionContext): void {
        ctx.env = { ...process.env, _ignoreEl: true };
        const jexlEngine = this.jexlEngineProvider.provide();
        jexlEngine.addTransform('replace',
                (val: string, searchValue: string | RegExp, replaceValue: string) => val && val.replace(new RegExp(searchValue, 'g'), replaceValue));
        jexlEngine.addTransform('regexp',  (pattern: string, flags?: string) => new RegExp(pattern, flags));
        const expressionHandler = ContainerUtil.get<ExpressionHandler>(ExpressionHandler);
        jexlEngine.addTransform('eval',  (text: string) => expressionHandler.handle(text));
    }

    priority = 500;

}
