import { Component } from '@celljs/core';
import { Observable, from } from 'rxjs';
import { ResponseEntity } from '@celljs/http';
import { AnthropicAPI } from '../api/api-protocol';
import { ChatRequest } from '../api/chat-request';
import { ChatResponse } from '../api/chat-response';
import { ContentBlockType } from '../api/content-block';
import { Role } from '../api/message';

@Component(AnthropicAPI)
export class MockAnthropicAPI implements AnthropicAPI {
    async chat(chatRequest: ChatRequest): Promise<ResponseEntity<ChatResponse>> {
        if (chatRequest.stream) {
            throw new Error('Request must set the stream property to false.');
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

        return {
            status: 200,
            headers: {
                'x-request-id': 'mock-req-123'
            },
            body: response
        };
    }

    async streamingChat(chatRequest: ChatRequest): Promise<Observable<ResponseEntity<ChatResponse>>> {
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

        return from([{
            status: 200,
            headers: {
                'x-request-id': 'mock-req-123'
            },
            body: response
        }]);
    }
}
