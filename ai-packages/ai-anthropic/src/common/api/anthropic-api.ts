import { Assert, Autowired, Component, Optional, Value } from '@celljs/core';
import { Observable } from 'rxjs';
import { map, filter, groupBy, concatMap, reduce  } from 'rxjs/operators';
import { ResponseEntity, RestOperations } from '@celljs/http';
import { ChatRequest } from './chat-request';
import { ChatResponse } from './chat-response';
import { AnthropicAPI, AnthropicAPIOptions } from './api-protocol';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { SSEUtil, StreamEvent } from '@celljs/ai-core';
import { EventType, AnthropicStreamEvent, ToolUseAggregationEvent } from './event';
import { StreamUtil } from '../utils';

@Component(AnthropicAPI)
export class AnthropicAPIImpl implements AnthropicAPI {

    @Autowired(RestOperations)
    protected readonly restOperations: RestOperations;

    @Value('cell.ai.anthropic.api')
    protected readonly options?: AnthropicAPIOptions;

    @Autowired(AnthropicAPIOptions)
    @Optional()
    protected readonly defaultOptions?: AnthropicAPIOptions;

    protected get baseUrl(): string {
        return this.options?.baseUrl ?? this.defaultOptions?.baseUrl ?? 'https://api.anthropic.com';
    }

    protected get apiKey(): string | undefined {
        return this.options?.apiKey ?? this.defaultOptions?.apiKey;
    }

    protected get anthropicVersion(): string {
        return this.options?.anthropicVersion ?? this.defaultOptions?.anthropicVersion ?? '2023-06-01';
    }

    async chat(chatRequest: ChatRequest): Promise<ResponseEntity<ChatResponse>> {
        Assert.isTrue(!chatRequest.stream, 'Request must set the stream property to false.');
        const { data, status, headers } = await this.restOperations
            .post('/v1/messages', instanceToPlain(chatRequest), { baseURL: this.baseUrl, signal: chatRequest.signal });

        return {
            status,
            headers,
            body: plainToInstance(ChatResponse, data)
        };
    }
    async streamingChat(chatRequest: ChatRequest): Promise<Observable<ResponseEntity<ChatResponse>>> {
        Assert.isTrue(chatRequest.stream, 'Request must set the stream property to true.');
        const { data, status, headers } = await this.restOperations
        .post<ReadableStream>(
            '/v1/messages',
            instanceToPlain(chatRequest),
            {
                baseURL: this.baseUrl,
                headers: {
                    'Accept': 'text/event-stream',
                },
                responseType: 'stream',
                signal: chatRequest.signal
            }
        );
        let isInsideTool = false;
        return SSEUtil.toObservable<StreamEvent<{}>>(data)
            .pipe(
                map(item => plainToInstance(AnthropicStreamEvent, item)),
                filter(item => item.data.type !== EventType.PING),
                map(item => {
                    if (StreamUtil.isToolUseStart(item.data)) {
                        isInsideTool = true;
                    }
                    return item;
                }),
                groupBy(item => {
                    if (isInsideTool && StreamUtil.isToolUseFinish(item.data)) {
                        isInsideTool = false;
                        return true;
                    }
                    return !isInsideTool;
                }),
                concatMap(group =>
                    group.pipe(
                        reduce(
                            (acc, curr) => StreamUtil.mergeToolUseEvents(acc, curr.data),
                            new ToolUseAggregationEvent()
                        )
                    )
                ),
                map(event => ({
                    status,
                    headers,
                    body: StreamUtil.eventToChatResponse(event)
                })),
                filter(response => !!response.body.type)
            );

    }
}
