import { Assert, Autowired, Component } from '@celljs/core';
import { ChatRequest, ChatResponse, EmbeddingsRequest, EmbeddingsResponse, OllamaAPI } from './api-protocol';
import { Observable } from 'rxjs';
import { RestOperations } from '@celljs/http';

@Component(OllamaAPI)
export class OllamaAPIImpl implements OllamaAPI {

    @Autowired(RestOperations)
    protected readonly restOperations!: RestOperations;

    chat(chatRequest: ChatRequest): Promise<ChatResponse> {
        Assert.isTrue(!chatRequest.stream, 'Stream mode must be disabled.');

        // return this.restClient.post()
        //     .uri("/api/chat")
        //     .body(chatRequest)
        //     .retrieve()
        //     .onStatus(this.responseErrorHandler)
        //     .body(ChatResponse.class);
        return this.restOperations.post('/api/chat', chatRequest);
    }
    streamingChat(chatRequest: ChatRequest): Observable<ChatResponse> {
        throw new Error('Method not implemented.');
    }
    embed(embeddingsRequest: EmbeddingsRequest): Promise<EmbeddingsResponse> {
        throw new Error('Method not implemented.');
    }

}
