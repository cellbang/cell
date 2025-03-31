import { EmbeddingModel } from '@celljs/ai-core';
import { DeepSeekAPI } from '../api';
import { Autowired, Component } from '@celljs/core';
import { DeepSeekEmbeddingOptions } from './deepseek-embedding-options';
import { OpenAIEmbeddingModel } from '@celljs/ai-openai';

@Component(EmbeddingModel)
export class DeepSeekEmbeddingModel extends OpenAIEmbeddingModel {

    @Autowired(DeepSeekEmbeddingOptions)
    protected override readonly defaultOptions: DeepSeekEmbeddingOptions;

    /**
     * Low-level access to the DeepSeek API.
     */
    @Autowired(DeepSeekAPI)
    protected override readonly chatApi: DeepSeekAPI;

}
