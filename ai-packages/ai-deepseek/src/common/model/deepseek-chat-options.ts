import { Constant } from '@celljs/core';
import { OpenAIChatOptions } from '@celljs/ai-openai';

/**
 * Options for the DeepSeek Chat API.
 */
@Constant(DeepSeekChatOptions, new DeepSeekChatOptions())
export class DeepSeekChatOptions extends OpenAIChatOptions {

}
