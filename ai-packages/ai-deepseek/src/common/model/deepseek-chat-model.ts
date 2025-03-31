import { ChatModel } from '@celljs/ai-core';
import { DeepSeekAPI } from '../api';
import { Autowired, Component } from '@celljs/core';
import { OpenAIChatModel } from '@celljs/ai-openai';
import { DeepSeekChatOptions } from './deepseek-chat-options';

/**
 * {@link ChatModel} implementation for {@literal DeepSeek} AI.
 * backed by {@link DeepSeekAPI}.
 */
@Component(ChatModel)
export class DeepSeekChatModel extends OpenAIChatModel {

    /**
     * The default options used for the chat completion requests.
     */
    @Autowired(DeepSeekChatOptions)
    protected override readonly defaultOptions: DeepSeekChatOptions;

    /**
     * Low-level access to the OpenAI API.
     */
    @Autowired(DeepSeekAPI)
    protected override readonly chatApi: DeepSeekAPI;
}
