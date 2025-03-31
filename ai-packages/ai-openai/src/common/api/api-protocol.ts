import { Observable } from 'rxjs';
import { ChatCompletionRequest } from './chat-request';
import { ChatCompletion, ChatCompletionChunk } from './chat-response';
import { EmbeddingResponse } from './embeddings-response';
import { EmbeddingRequest } from './embeddings-request';
import { ResponseEntity } from '@celljs/http';

export const OpenAIAPIOptions = Symbol('OpenAIAPIOptions');
export const OpenAIAPI = Symbol('OpenAIAPI');

export interface OpenAIAPIOptions {
    baseUrl?: string;
    apiKey?: string;
    completionsPath?: string;
    embeddingsPath?: string;
}

/**
 * Interface representing the OpenAI API.
 */
export interface OpenAIAPI {
    /**
     * Creates a model response for the given chat conversation.
     * @param chatRequest - The chat completion request.
     * @param additionalHttpHeader - Optional, additional HTTP headers to be added to the request.
     * @returns A promise that resolves to the chat completion response.
     */
    chat(chatRequest: ChatCompletionRequest, additionalHttpHeader?: Record<string, string>): Promise<ResponseEntity<ChatCompletion>>;

    /**
     * Creates a streaming chat response for the given chat conversation.
     * @param chatRequest - The chat completion request. Must have the stream property set to true.
     * @param additionalHttpHeader - Optional, additional HTTP headers to be added to the request.
     * @returns A promise that resolves to an observable of chat completion chunks.
     */
    streamingChat(chatRequest: ChatCompletionRequest, additionalHttpHeader?: Record<string, string>): Promise<Observable<ResponseEntity<ChatCompletionChunk>>>;

    /**
     * Creates an embedding vector representing the input text or token array.
     * @param embeddingsRequest - The embedding request.
     * @typeParam T - Type of the entity in the data list. Can be a string or list of tokens (e.g., integers).
     * For embedding multiple inputs in a single request, you can pass a list of strings or a list of lists of tokens.
     * @example
     * ```typescript
     * embed(List.of("text1", "text2", "text3"));
     * embed(List.of(List.of(1, 2, 3), List.of(3, 4, 5)));
     * ```
     * @returns A promise that resolves to an embedding response containing a list of embeddings.
     */
    embed<T>(embeddingsRequest: EmbeddingRequest<T>): Promise<ResponseEntity<EmbeddingResponse>>;
}
