import { OllamaAPI } from '../api/api-protocol';
import { ChatRequest } from '../api/chat-request';
import { ChatResponse } from '../api/chat-response';
import { EmbeddingsRequest } from '../api/embeddings-request';
import { EmbeddingsResponse } from '../api/embeddings-response';
import { of, Observable } from 'rxjs';
import { Role } from '../api/message';
import { ResponseEntity } from '@celljs/http';

export class MockOllamaAPI implements OllamaAPI {
    async chat(chatRequest: ChatRequest): Promise<ResponseEntity<ChatResponse>> {
        return {
            status: 200,
            headers: {},
            body: {
                model: 'test-model',
                createdAt: new Date(),
                message: {
                    role: Role.ASSISTANT,
                    content: 'Hello, how can I help you?',
                    toolCalls: []
                },
                doneReason: 'stop',
                done: true,
                totalDuration: 150,
                loadDuration: 100,
                promptEvalCount: 10,
                promptEvalDuration: 50,
                evalCount: 20,
                evalDuration: 100
            }
        };
    }

    async streamingChat(chatRequest: ChatRequest): Promise<Observable<ResponseEntity<ChatResponse>>> {
        return of({
            status: 200,
            headers: {},
            body: {
                model: 'test-model',
                createdAt: new Date(),
                message: {
                    role: Role.ASSISTANT,
                    content: 'Hello, how can I help you?',
                    toolCalls: []
                },
                doneReason: 'stop',
                done: true,
                totalDuration: 150,
                loadDuration: 100,
                promptEvalCount: 10,
                promptEvalDuration: 50,
                evalCount: 20,
                evalDuration: 100
            }
        });
    }

    async embed(embeddingsRequest: EmbeddingsRequest): Promise<ResponseEntity<EmbeddingsResponse>> {
        return {
            status: 200,
            headers: {},
            body: {
                embeddings: [],
                model: 'test-model',
            }
        };
    }
}
