import { Component } from '@celljs/core';
import { Observable, from } from 'rxjs';
import { AnthropicAPI } from '../api/api-protocol';
import { ChatRequest } from '../api/chat-request';
import { ChatResponse } from '../api/chat-response';
import { ContentBlockType } from '../api/content-block';
import { Role } from '../api/message';

@Component(AnthropicAPI)
export class MockAnthropicAPI implements AnthropicAPI {
    async chat(chatRequest: ChatRequest): Promise<ChatResponse> {
        if (chatRequest.stream) {
            throw new Error('Request must set the stream property to false.');
        }

        return new ChatResponse(
            'msg_123',
            'message',
            Role.ASSISTANT,
            [
                {
                    type: ContentBlockType.TEXT,
                    text: 'How can I assist you today?'
                }
            ],
            chatRequest.model,
            'end_turn',
            undefined,
            {
                inputTokens: 10,
                outputTokens: 20
            }
        );
    }

    async streamingChat(chatRequest: ChatRequest): Promise<Observable<ChatResponse>> {
        if (!chatRequest.stream) {
            throw new Error('Request must set the stream property to true.');
        }

        const response = new ChatResponse(
            'msg_123',
            'message',
            Role.ASSISTANT,
            [
                {
                    type: ContentBlockType.TEXT,
                    text: 'How can I assist you today?'
                }
            ],
            chatRequest.model,
            'end_turn',
            undefined,
            {
                inputTokens: 10,
                outputTokens: 20
            }
        );

        return from([response]);
    }
}
