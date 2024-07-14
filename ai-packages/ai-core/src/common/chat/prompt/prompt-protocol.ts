import { ModelOptions, ModelRequest } from '../../model/model-protocol';
import { Media, Message } from '../message';

/**
 * The ChatOptions represent the common options, portable across different chat models.
 */
export interface ChatOptions extends ModelOptions {

    readonly temperature?: number;
    readonly topP?: number;
    readonly topK?: number;

}

export interface Prompt extends ModelRequest<Message[]> {
    readonly contents: string;
    copy(): Prompt;
}

export interface PromptTemplateStringActions {

    render(model?: Map<String, Object>): string;

}

export interface PromptTemplateActions extends PromptTemplateStringActions {

    create(model: Map<String, Object>): Prompt;

}

export interface PromptTemplateChatActions {

    createMessages(): Message[];
    createMessages(model: Map<String, Object>): Message[];

}

export interface PromptTemplateMessageActions {

    createMessage(mediaList: Media[]): Message;
    createMessage(model: Map<String, Object>): Message;

}
