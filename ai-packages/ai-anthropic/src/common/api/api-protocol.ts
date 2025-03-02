import { Observable } from 'rxjs';
import { ChatRequest } from './chat-request';
import { ChatResponse } from './chat-response';
import { ResponseEntity } from '@celljs/http';

export const AnthropicAPI = Symbol('AnthropicAPI');
export const AnthropicAPIOptions = Symbol('AnthropicAPIOptions');

/**
 * Anthropic API options.
 */
export interface AnthropicAPIOptions {
    /**
     * Base URL of the Anthropic API.
     */
    baseUrl?: string;

    /**
     * API key to authenticate with the Anthropic API.
     */
    apiKey?: string;

    /**
     * Version of the Anthropic API.
     */
    anthropicVersion?: string;
}

export interface AnthropicAPI {
    /**
     * Generate the next message in a chat with a provided model.
     * This is a streaming endpoint (controlled by the 'stream' request property), so
     * there will be a series of responses. The final response object will include
     * statistics and additional data from the request.
     * @param chatRequest Chat request.
     * @return Chat response.
     */
    chat(chatRequest: ChatRequest): Promise<ResponseEntity<ChatResponse>>;
    /**
     * Streaming response for the chat completion request.
     * @param chatRequest Chat request. The request must set the stream property to true.
     * @return Chat response as a {@link Flux} stream.
     */
    streamingChat(chatRequest: ChatRequest): Promise<Observable<ResponseEntity<ChatResponse>>>;

}
