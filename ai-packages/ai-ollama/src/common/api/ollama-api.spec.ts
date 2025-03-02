import { expect } from 'chai';
import { ChatRequest } from './chat-request';
import { EmbeddingsRequest } from './embeddings-request';
import { RestOperations } from '@celljs/http';
import { createContainer } from '../test/test-container';
import { OllamaAPI } from './api-protocol';
import { OllamaModel } from './ollama-model';
import '../index';

const container = createContainer();

describe('OllamaAPIImpl', () => {
    let ollamaAPI: OllamaAPI;

    beforeEach(() => {
        container.rebind(RestOperations).toConstantValue({
            post: async (url: string, data: any, config: any) => {
                const mockResponse = {
                    status: 200,
                    headers: {
                        'content-type': 'application/json'
                    }
                };

                if (url === '/api/embed') {
                    return {
                        ...mockResponse,
                        data: {
                            model: data.model,
                            embeddings: [
                              [0.1, 0.2],
                              [0.3, 0.4]
                            ]
                        }
                    };
                }
                const chatResponse = {
                    model: data.model,
                    createdAt: '2024-12-15T12:37:28.246Z',
                    message: {
                        role: 'assistant',
                        content: 'How can I assist you today?',
                        images: undefined,
                        toolCalls: undefined,
                    },
                    doneReason: 'stop',
                    done: true,
                    totalDuration: 523675875,
                    loadDuration: 36406584,
                    promptEvalCount: 26,
                    promptEvalDuration: 353000000,
                    evalCount: 8,
                    evalDuration: 132000000,
                };
                
                if (data.stream) {
                    const steam = new ReadableStream();
                    const reader = steam.getReader();
                    const chatResponse$ = new ReadableStream({
                        start(controller) {
                            controller.enqueue(JSON.stringify(chatResponse));
                        },
                        cancel() {
                            reader.cancel();
                        }
                    });

                    return {
                        ...mockResponse,
                        data: chatResponse$
                    };
                }

                return {
                    ...mockResponse,
                    data: chatResponse
                };
            }
        });
        ollamaAPI = container.get(OllamaAPI);
    });

    describe('chat', () => {
        it('should return a ResponseEntity with ChatResponse', async () => {
            const chatRequest = ChatRequest.builder(OllamaModel.LLAMA3_2).build();
            const response = await ollamaAPI.chat(chatRequest);
            
            expect(response.status).to.equal(200);
            expect(response.headers).to.have.property('content-type', 'application/json');
            expect(response.body).to.have.property('model', OllamaModel.LLAMA3_2);
        });

        it('should throw an error if stream mode is enabled', async () => {
            const chatRequest = ChatRequest.builder(OllamaModel.LLAMA3_2).withStream(true).build();
            try {
                await ollamaAPI.chat(chatRequest);
            } catch (e) {
                expect(e.message).to.equal('Stream mode must be disabled.');
            }
        });
    });

    describe('streamingChat', () => {
        it('should return an Observable of ResponseEntity with ChatResponse', async () => {
            const chatRequest = ChatRequest.builder(OllamaModel.LLAMA3_2).withStream(true).build();
            const response$ = await ollamaAPI.streamingChat(chatRequest);
            response$.subscribe({
                next: response => {
                    expect(response.status).to.equal(200);
                    expect(response.headers).to.have.property('content-type', 'application/json');
                    expect(response.body).to.have.property('model', OllamaModel.LLAMA3_2);
                }
            });
        });

        it('should throw an error if stream mode is disabled', async () => {
            const chatRequest = ChatRequest.builder(OllamaModel.LLAMA3_2).withStream(false).build();
            try {
                await ollamaAPI.streamingChat(chatRequest);
            } catch (e) {
                expect(e.message).to.equal('Stream mode must be enabled.');
            }
        });
    });

    describe('embed', () => {
        it('should return a ResponseEntity with EmbeddingsResponse', async () => {
            const embeddingsRequest = new EmbeddingsRequest(OllamaModel.LLAMA3_2, ['input']);
            const response = await ollamaAPI.embed(embeddingsRequest);
            
            expect(response.status).to.equal(200);
            expect(response.headers).to.have.property('content-type', 'application/json');
            expect(response.body).to.have.property('model', OllamaModel.LLAMA3_2);
            expect(response.body).to.have.property('embeddings').to.have.length(2);
        });
    });
});
