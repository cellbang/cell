import { expect } from 'chai';
import { RestOperations } from '@celljs/http';
import { createContainer } from '../test/test-container';
import { OpenAIAPI } from './api-protocol';
import { ChatCompletionRequest } from './chat-request';
import { EmbeddingRequest } from './embeddings-request';
import { Role } from './message';
import '../index';

describe('OpenAIAPI', () => {
    const container = createContainer();
    let openaiAPI: OpenAIAPI;

    // Mock response data
    const mockResponses = {
        chat: {
            id: 'chatcmpl-123',
            object: 'chat.completion',
            created: 1677652288,
            model: 'gpt-3.5-turbo',
            choices: [{
                index: 0,
                message: {
                    role: 'assistant',
                    content: 'Hello! How can I help you today?'
                },
                finish_reason: 'stop'
            }],
            usage: {
                prompt_tokens: 9,
                completion_tokens: 12,
                total_tokens: 21
            }
        },
        stream: {
            id: 'chatcmpl-123',
            object: 'chat.completion.chunk',
            created: 1677652288,
            model: 'gpt-3.5-turbo',
            choices: [{
                index: 0,
                delta: {
                    role: 'assistant',
                    content: 'Hello'
                }
            }]
        },
        embeddings: {
            object: 'list',
            data: [{ object: 'embedding', embedding: [0.1, 0.2, 0.3], index: 0 }],
            model: 'text-embedding-3-small',
            usage: { prompt_tokens: 8, total_tokens: 8 }
        }
    };

    beforeEach(() => {
        // Configure mock REST operations
        container.rebind(RestOperations).toConstantValue({
            post: async (url: string, data: any) => {
                if (url === '/v1/embeddings') {
                    return { data: mockResponses.embeddings };
                }
                if (data.stream) {
                    const stream = new ReadableStream({
                        start(controller) {
                            controller.enqueue(`data: ${JSON.stringify(mockResponses.stream)}\n\n`);
                            controller.enqueue('data: [DONE]\n\n');
                            controller.close();
                        }
                    });
                    return { data: stream };
                }
                return { data: mockResponses.chat };
            }
        });
        openaiAPI = container.get(OpenAIAPI);
    });

    describe('chat', () => {
        it('should return correct response for non-streaming request', async () => {
            const request = new ChatCompletionRequest();
            request.model = 'gpt-3.5-turbo';
            request.messages = [{ role: Role.USER, content: 'Hello' }];

            const response = await openaiAPI.chat(request);

            expect(response.body.id).to.equal('chatcmpl-123');
            expect(response.body.choices[0].message.content).to.equal('Hello! How can I help you today?');
            expect(response.body.usage.totalTokens).to.equal(21);
        });

        it('should throw error when stream is enabled', async () => {
            const request = new ChatCompletionRequest();
            request.model = 'gpt-3.5-turbo';
            request.messages = [{ role: Role.USER, content: 'Hello' }];
            request.stream = true;
            try {
                await openaiAPI.chat(request);
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(e.message).to.include('Request must set the stream property to false.');
            }
        });
    });

    describe('chat', () => {
        it('should throw error when stream is disabled', async () => {
            const request = new ChatCompletionRequest();
            request.model = 'gpt-3.5-turbo';
            request.messages = [{ role: Role.USER, content: 'Hello' }];
            request.stream = false;
            try {
                await openaiAPI.chat(request);
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(e.message).to.include('Request must set the stream property to true.');
            }
        });
    });

    describe('streamingChat', () => {
        it('should handle streaming response correctly', done => {
            const request = new ChatCompletionRequest();
            request.model = 'gpt-3.5-turbo';
            request.messages = [{ role: Role.USER, content: 'Hello' }];
            request.stream = true;

            openaiAPI.streamingChat(request).then(response$ => {
                response$.subscribe({
                    next: chunk => {
                        expect(chunk.body.id).to.equal('chatcmpl-123');
                        expect(chunk.body.choices[0].delta.content).to.equal('Hello');
                        done();
                    }
                });
            });
        });

        it('should throw error when stream is disabled', async () => {
            const request = new ChatCompletionRequest();
            request.model = 'gpt-3.5-turbo';
            request.messages = [{ role: Role.USER, content: 'Hello' }];
            request.stream = false;

            try {
                await openaiAPI.streamingChat(request);
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(e.message).to.include('Request must set the stream property to true.');
            }
        });
    });

    describe('embed', () => {
        it('should return correct embedding vectors', async () => {
            const request = EmbeddingRequest.fromInput('Hello world');
            const response = await openaiAPI.embed(request);

            expect(response.body.object).to.equal('list');
            expect(response.body.data[0].embedding).to.deep.equal([0.1, 0.2, 0.3]);
            expect(response.body.model).to.equal('text-embedding-3-small');
        });

        it('should support batch inputs', async () => {
            const request = EmbeddingRequest.fromInputAndModel(
                ['Hello', 'World'],
                'text-embedding-3-small'
            );

            const response = await openaiAPI.embed(request);
            expect(response.body.data[0].embedding).to.deep.equal([0.1, 0.2, 0.3]);
            expect(response.body.usage.totalTokens).to.equal(8);
        });
    });
});
