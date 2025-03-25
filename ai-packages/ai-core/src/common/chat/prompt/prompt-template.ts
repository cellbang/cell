import { Autowired, Component, ExpressionHandler, IllegalArgumentError } from '@celljs/core';
import { Prompt, PromptTemplate, PromptTemplateContext } from './prompt-protocol';
import { PromptImpl } from './prompt';
import { Message, MessageType, SystemMessage } from '../message';

@Component(PromptTemplate)
export class PromptTemplateImpl implements PromptTemplate {

    @Autowired(ExpressionHandler)
    protected readonly expressionHandler: ExpressionHandler;

    async render(template: string, ctx?: PromptTemplateContext): Promise<string> {
        if (ctx?.variables) {
            return this.expressionHandler.handle(template, ctx, { ignoreSpecialChar: true, bracketBegin: '{', bracketEnd: '}' });
        }
        return template;
    }
    async create(template: string | Message[], ctx?: PromptTemplateContext): Promise<Prompt> {
        if (Array.isArray(template)
            && template.some(message => Message.isMessage(message))
        ) {
            return new PromptImpl(template, ctx?.chatOptions);
        } else if (typeof template === 'string') {
            if (!ctx?.messageType || ctx?.messageType === MessageType.USER) {
                return new PromptImpl(await this.render(template, ctx), ctx?.chatOptions);
            } else if (ctx?.messageType === MessageType.SYSTEM) {
                return new PromptImpl(new SystemMessage(await this.render(template, ctx)), ctx?.chatOptions);
            }
        }
        throw new IllegalArgumentError(`Invalid message type: ${ctx?.messageType}`);
    }
}
