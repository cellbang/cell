import { Observable } from 'rxjs';
import { ChatRequest } from './chat-request';
import { ChatResponse } from './chat-response';
import { EmbeddingsResponse } from './embeddings-response';
import { EmbeddingsRequest } from './embeddings-request';

export const OllamaAPI = Symbol('OllamaAPI');

export interface OllamaAPI {
    /**
     * Generate the next message in a chat with a provided model.
     * This is a streaming endpoint (controlled by the 'stream' request property), so
     * there will be a series of responses. The final response object will include
     * statistics and additional data from the request.
     * @param chatRequest Chat request.
     * @return Chat response.
     */
    chat(chatRequest: ChatRequest): Promise<ChatResponse>;
    /**
     * Streaming response for the chat completion request.
     * @param chatRequest Chat request. The request must set the stream property to true.
     * @return Chat response as a {@link Flux} stream.
     */
    streamingChat(chatRequest: ChatRequest): Promise<Observable<ChatResponse>>;
    /**
     * Generate embeddings from a model.
     * @param embeddingsRequest Embedding request.
     * @return Embeddings response.
     */
    embed(embeddingsRequest: EmbeddingsRequest): Promise<EmbeddingsResponse>;

}
