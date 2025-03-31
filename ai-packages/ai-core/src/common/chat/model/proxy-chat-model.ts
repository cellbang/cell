import { Autowired, Component, IllegalArgumentError } from '@celljs/core';
import { ChatModel, ChatResponse } from './chat-protocol';
import { Observable } from 'rxjs';
import { Prompt } from '../prompt';

@Component(ProxyChatModel)
export class ProxyChatModel implements ChatModel {

    @Autowired(ChatModel)
    protected readonly chatModels: ChatModel[];

    protected readonly chatModelMap: Map<string, ChatModel> = new Map();

    protected init() {
        for (const chatModel of this.chatModels) {
            if ('provider' in chatModel) {
                // @ts-ignore
                this.chatModelMap.set(chatModel.provider as string, chatModel);
            } else {
                const provider = chatModel.constructor.name.split('ChatModel')[0].toLowerCase();
                this.chatModelMap.set(provider, chatModel);
            }
        }
    }

    protected resolveChatModelAndPrompt(prompt: Prompt): [ChatModel, Prompt] {
        const model = prompt.options.model;
        if (!model) {
            throw new IllegalArgumentError('Model not specified in prompt options.');
        }
        if (!model.includes(':')) {
            throw new IllegalArgumentError('Invalid model name format. Expected "<provider>:<model-name>".');
        }
        const [provider, modelName] = model.split(':');
        const chatModel = this.chatModelMap.get(provider);
        if (!chatModel) {
            throw new IllegalArgumentError(`Chat model provider "${provider}" not found.`);
        }
        const newPrompt = prompt.copy();
        newPrompt.options.model = modelName;
        return [chatModel, newPrompt];
    }

    call(prompt: Prompt): Promise<ChatResponse> {
        const [chatModel, newPrompt] = this.resolveChatModelAndPrompt(prompt);
        return chatModel.call(newPrompt);
    }

    stream(prompt: Prompt): Promise<Observable<ChatResponse>> {
        const [chatModel, newPrompt] = this.resolveChatModelAndPrompt(prompt);
        return chatModel.stream(newPrompt);
    }

}
