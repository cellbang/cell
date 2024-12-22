import { Assert, Autowired, Component, Value } from '@celljs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RestOperations } from '@celljs/http';
import { ChatRequest } from './chat-request';
import { EmbeddingsRequest } from './embeddings-request';
import { EmbeddingsResponse } from './embeddings-response';
import { ChatResponse } from './chat-response';
import { OllamaAPI } from './api-protocol';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { SSEUtil } from '@celljs/ai-core';

@Component(OllamaAPI)
export class OllamaAPIImpl implements OllamaAPI {

    @Autowired(RestOperations)
    protected readonly restOperations: RestOperations;

    @Value('cell.ai.ollama.api.baseUrl ?: "http://localhost:11434"')
    protected readonly baseUrl: string;

    async chat(chatRequest: ChatRequest): Promise<ChatResponse> {
        Assert.isTrue(!chatRequest.stream, 'Stream mode must be disabled.');
        const { data } = await this.restOperations
            .post('/api/chat', instanceToPlain(chatRequest), { baseURL: this.baseUrl });

        return plainToInstance(ChatResponse, data);
    }
    async streamingChat(chatRequest: ChatRequest): Promise<Observable<ChatResponse>> {
        Assert.isTrue(chatRequest.stream, 'Stream mode must be enabled.');
        const { data } = await this.restOperations
        .post<ReadableStream>(
            '/api/chat',
            instanceToPlain(chatRequest),
            {
                baseURL: this.baseUrl,
                headers: {
                    'Accept': 'text/event-stream',
                },
                responseType: 'stream'
            }
        );
        return SSEUtil.toObservable(data).pipe(
            map(item => plainToInstance(ChatResponse, item))
        );

    }
    async embed(embeddingsRequest: EmbeddingsRequest): Promise<EmbeddingsResponse> {
        const { data } = await this.restOperations
            .post<EmbeddingsResponse>('/api/embed', instanceToPlain(embeddingsRequest), { baseURL: this.baseUrl });
        return plainToInstance(EmbeddingsResponse, data);
    }

}
