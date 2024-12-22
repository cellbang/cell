import { ModelOptions, ModelRequest } from '../../model/model-protocol';
import { Message, MessageType } from '../message/message-protocol';

export const PromptTemplate = Symbol('PromptTemplate');

/**
 * The ChatOptions represent the common options, portable across different chat models.
 */
export interface ChatOptions extends ModelOptions {
    model?: string;
    frequencyPenalty?: number;
    maxTokens?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    temperature?: number;
    topK?: number;
    topP?: number;
}

export interface Prompt extends ModelRequest<Message[]> {
    readonly contents: string;
    copy(): Prompt;
}

export interface PromptTemplateContext {
    variables?: Record<string, any>;
    chatOptions?: ChatOptions;
    messageType?: MessageType;
}

export interface PromptTemplate {
    render(template: string, ctx?: PromptTemplateContext): Promise<string>;
    create(template: string, ctx?: PromptTemplateContext): Promise<Prompt>;
}
