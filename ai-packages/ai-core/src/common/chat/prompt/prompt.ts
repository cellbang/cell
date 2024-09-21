import { IllegalArgumentError } from '@celljs/core';
import { ModelOptions } from '../../model/model-protocol';
import { Message, MessageType, UserMessage } from '../message';
import { ChatOptions, Prompt } from './prompt-protocol';

export class PromptImpl implements Prompt {

    protected messages: Message[];

    protected modelOptions: ChatOptions;
    constructor(messages: Message[] | Message | string, modelOptions: ChatOptions = {}) {
        this.modelOptions = modelOptions;
        if (Array.isArray(messages)) {
            this.messages = messages;
        } else if (typeof messages === 'string') {
            this.messages = [new UserMessage(messages)];
        } else {
            this.messages = [messages];
        }
    }

    private instructionsCopy(): Message[] {
        return this.messages.map(message => {
            if (message.messageType === MessageType.USER) {
                return new UserMessage(message.content);
            } else if (message.messageType === MessageType.ASSISTANT) {
                return new UserMessage(message.content);
            } else if (message.messageType === MessageType.SYSTEM) {
                return new UserMessage(message.content);
            } else if (message.messageType === MessageType.FUNCTION) {
                return new UserMessage(message.content);
            } else {
                throw new IllegalArgumentError(`Unsupported message type: ${message.messageType}`);
            }
        });
    }
    copy(): Prompt {
        return new PromptImpl(this.instructionsCopy(), this.modelOptions);
    }

    get contents(): string {
        let contents = '';
        for (const message of this.messages) {
            contents += message.content;
        }
        return contents;
    }

    get instructions(): Message[] {
        return this.messages;
    }

    get options(): ModelOptions {
        return this.modelOptions;
    }
}

