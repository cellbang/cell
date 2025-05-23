import { Component, IllegalArgumentError } from '@celljs/core';
import { Prompt, PromptTemplate, PromptTemplateContext } from './prompt-protocol';
import { PromptImpl } from './prompt';
import { Message, MessageType, SystemMessage } from '../message';

@Component(PromptTemplate)
export class SamplePromptTemplate implements PromptTemplate {

    async render(template: string, ctx?: PromptTemplateContext): Promise<string> {
        let newTemplate = template;
        if (ctx?.variables) {
            for (const key of Object.keys(ctx.variables)) {
                newTemplate = newTemplate.replace(new RegExp(`{${key}}`, 'g'), ctx.variables[key]);
            }
        }
        return newTemplate;
    }
    async create(template: string | Message[], ctx?: PromptTemplateContext): Promise<Prompt> {
        if (Array.isArray(template)
            && template.some(message => Message.isMessage(message))
        ) {
            for (const message of template) {
                message.content = await this.render(message.content, ctx);
            }
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
