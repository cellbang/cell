import { Autowired, Component, Optional, PostConstruct, Value } from '@celljs/core';
import { DeepSeekPIOptions } from './api-protocol';
import { OpenAIAPIImpl } from '@celljs/ai-openai';

@Component(DeepSeekAPI)
export class DeepSeekAPI extends OpenAIAPIImpl {

    @Value('cell.ai.deepseek.api')
    protected override readonly apiOptions: DeepSeekPIOptions;

    @Autowired(DeepSeekPIOptions)
    @Optional()
    protected override readonly apiOptions2: DeepSeekPIOptions;

    protected override finalApiOptions: Required<DeepSeekPIOptions>;

    @PostConstruct()
    protected override init() {
        super.init();
        this.finalApiOptions = {
            baseUrl: 'https://api.deepseek.ai',
            apiKey: '',
            completionsPath: '/chat/completions',
            embeddingsPath: '/embeddings',
            ...this.apiOptions,
            ...this.apiOptions2
        };
    }
}
