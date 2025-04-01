import { Autowired, Component, Optional, PostConstruct, Value } from '@celljs/core';
import { DeepSeekAPIOptions } from './api-protocol';
import { OpenAIAPIImpl } from '@celljs/ai-openai';

@Component(DeepSeekAPI)
export class DeepSeekAPI extends OpenAIAPIImpl {

    @Value('cell.ai.deepseek.api')
    protected override readonly apiOptions: DeepSeekAPIOptions;

    @Autowired(DeepSeekAPIOptions)
    @Optional()
    protected override readonly apiOptions2: DeepSeekAPIOptions;

    protected override finalApiOptions: Required<DeepSeekAPIOptions>;

    @PostConstruct()
    protected override init() {
        super.init();
        this.finalApiOptions = {
            baseUrl: 'https://api.deepseek.com',
            apiKey: '',
            completionsPath: '/chat/completions',
            embeddingsPath: '/embeddings',
            ...this.apiOptions,
            ...this.apiOptions2
        };
    }
}
