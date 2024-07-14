import { ChatOptions, Message, Prompt, PromptImpl } from '../chat';

export abstract class PromptUtil {
    public static create(messages: Message[] | Message | string, options: ChatOptions = {}): Prompt {
        return new PromptImpl(messages, options);
    }
}
