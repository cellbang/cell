import { Assert, Autowired, Component, Optional, PostConstruct, Value } from '@celljs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpHeaders, MediaType, ResponseEntity, RestOperations } from '@celljs/http';
import { ChatCompletionRequest } from './chat-request';
import { EmbeddingRequest } from './embeddings-request';
import { EmbeddingResponse } from './embeddings-response';
import { ChatCompletion, ChatCompletionChunk } from './chat-response';
import { OpenAIAPI, OpenAIAPIOptions } from './api-protocol';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { SSEUtil } from '@celljs/ai-core';

@Component(OpenAIAPI)
export class OpenAIAPIImpl implements OpenAIAPI {

    @Autowired(RestOperations)
    protected readonly restOperations: RestOperations;

    @Value('cell.ai.openai.api')
    protected readonly apiOptions: OpenAIAPIOptions;

    @Autowired(OpenAIAPIOptions)
    @Optional()
    protected readonly apiOptions2: OpenAIAPIOptions;

    protected finalApiOptions: Required<OpenAIAPIOptions>;

    protected readonly finalHeaders: Record<string, string> = {};

    @PostConstruct()
    protected init() {
        this.finalApiOptions = {
            baseUrl: 'https://api.openai.com',
            apiKey: '',
            completionsPath: '/v1/chat/completions',
            embeddingsPath: '/v1/embeddings',
            ...this.apiOptions,
            ...this.apiOptions2
        };

        this.finalHeaders[HttpHeaders.CONTENT_TYPE] = MediaType.APPLICATION_JSON;
        if (this.finalApiOptions.apiKey) {
            this.finalHeaders[HttpHeaders.AUTHORIZATION] = `Bearer ${this.finalApiOptions.apiKey}`;
        }
    }

    async chat(chatRequest: ChatCompletionRequest, additionalHttpHeader?: Record<string, string>): Promise<ResponseEntity<ChatCompletion>> {
        Assert.isTrue(!chatRequest.stream, 'Request must set the stream property to false.');
        const { data, status, headers } = await this.restOperations
            .post(
                this.finalApiOptions.completionsPath,
                instanceToPlain(chatRequest, { excludeExtraneousValues: true }),
                {
                    baseURL: this.finalApiOptions.baseUrl,
                    headers: {
                        ...this.finalHeaders,
                        ...additionalHttpHeader
                    },
                    signal: chatRequest.signal,
                },
            );

        return {
            status,
            headers,
            body: plainToInstance(ChatCompletion, data)
        };

    }
    async streamingChat(chatRequest: ChatCompletionRequest, additionalHttpHeader?: Record<string, string>): Promise<Observable<ResponseEntity<ChatCompletionChunk>>> {
        Assert.isTrue(!!chatRequest.stream, 'Request must set the stream property to true.');
        const { data, status, headers } = await this.restOperations
        .post<ReadableStream>(
            this.finalApiOptions.completionsPath,
            instanceToPlain(chatRequest, { excludeExtraneousValues: true }),
            {
                baseURL: this.finalApiOptions.baseUrl,
                headers: {
                    ...this.finalHeaders,
                    [HttpHeaders.ACCEPT]: MediaType.TEXT_EVENT_STREAM,
                    ...additionalHttpHeader

                },
                signal: chatRequest.signal,
                responseType: 'stream'
            }
        );
        return SSEUtil.toObservable(data).pipe(map(item =>
            ({
                status,
                headers,
                body: plainToInstance(ChatCompletionChunk, item.data)
            })
        ));

    }

    async embed<T>(embeddingRequest: EmbeddingRequest<T>): Promise<ResponseEntity<EmbeddingResponse>> {
        // Input text to embed, encoded as a string or array of tokens. To embed multiple
        // inputs in a single
        // request, pass an array of strings or array of token arrays.
        Assert.notNull(embeddingRequest.input, 'The input can not be null.');
        Assert.isTrue(typeof embeddingRequest.input === 'string' || Array.isArray(embeddingRequest.input),
                'The input must be either a String, or a List of Strings or List of List of integers.');

        // The input must not exceed the max input tokens for the model (8192 tokens for
        // text-embedding-ada-002), cannot
        // be an empty string, and any array must be 2048 dimensions or less.
        if (Array.isArray(embeddingRequest.input)) {
            Assert.isTrue(embeddingRequest.input.length > 0, 'The input list can not be empty.');
            Assert.isTrue(embeddingRequest.input.length <= 2048, 'The list must be 2048 dimensions or less');
            Assert.isTrue(
                typeof embeddingRequest.input[0] === 'string' || typeof embeddingRequest.input[0] === 'number' || Array.isArray(embeddingRequest.input[0]),
                    'The input must be either a String, or a List of Strings or list of list of integers.');
        }
        const { data, status, headers } = await this.restOperations
            .post<EmbeddingResponse>(
                this.finalApiOptions.embeddingsPath,
                instanceToPlain(embeddingRequest, { excludeExtraneousValues: true }),
                { baseURL: this.finalApiOptions.baseUrl, signal: embeddingRequest.signal });
        return {
            status,
            headers,
            body: plainToInstance(EmbeddingResponse, data)
        };
    }

}
