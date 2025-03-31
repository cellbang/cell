import { Constant } from '@celljs/core';
import { OpenAIEmbeddingOptions } from '@celljs/ai-openai';

/**
 * DeepSeek Embedding Options.
 */
@Constant(DeepSeekEmbeddingOptions, new DeepSeekEmbeddingOptions())
export class DeepSeekEmbeddingOptions extends OpenAIEmbeddingOptions {
}
