import { expect } from 'chai';
import { ChatRequest } from './chat-request';
import { RestOperations } from '@celljs/http';
import { createContainer } from '../test/test-container';
import { AnthropicAPI } from './api-protocol';
import { AnthropicModel } from './anthropic-model';
import { ContentBlock, ContentBlockType } from './content-block';
import { Role, AnthropicMessage } from './message';
import { ChatResponse } from './chat-response';
import '../index';

const container = createContainer();

describe('AnthropicAPIImpl', () => {
    let anthropicAPI: AnthropicAPI;

    beforeEach(() => {
        container.rebind(RestOperations).toConstantValue({
            post: async (url: string, data: any, config: any) => {
                const responseBody = {
                    id: 'msg_123',
                    type: 'message',
                    role: Role.ASSISTANT,
                    content: [
                        {
                            type: ContentBlockType.TEXT,
                            text: 'How can I assist you today?'
                        }
                    ],
                    model: data.model,
                    stop_reason: 'end_turn',
                    stop_sequence: undefined,
                    usage: {
                        input_tokens: 10,
                        output_tokens: 20
                    }
                };

                if (data.stream) {
                    const steam = new ReadableStream({
                        start(controller) {
                            controller.enqueue('data: ' + JSON.stringify({
                                type: 'message_start',
                                data: responseBody
                            }) + '\n\n');
                            controller.close();
                        }
                    });
                    return { 
                        data: steam,
                        status: 200,
                        headers: { 'content-type': 'text/event-stream' }
                    };
                }

                return {
                    data: responseBody,
                    status: 200,
                    headers: { 'content-type': 'application/json' }
                };
            }
        });
        anthropicAPI = container.get(AnthropicAPI);
    });

    describe('chat', () => {
        it('should return a ResponseEntity with ChatResponse', async () => {
            const messages = [
                new AnthropicMessage(
                    [new ContentBlock(ContentBlockType.TEXT, undefined, 'Hello')],
                    Role.USER
                )
            ];
            const chatRequest = ChatRequest.builder()
                .withModel(AnthropicModel.CLAUDE_3_HAIKU)
                .withMessages(messages)
                .withMaxTokens(1000)
                .withStream(false)
                .build();

            const response = await anthropicAPI.chat(chatRequest);
            expect(response.status).to.equal(200);
            expect(response.headers).to.deep.include({ 'content-type': 'application/json' });
            expect(response.body).to.be.instanceOf(ChatResponse);
            expect(response.body.model).to.equal(AnthropicModel.CLAUDE_3_HAIKU);
        });

        it('should throw an error if stream mode is enabled', async () => {
            const messages = [
                new AnthropicMessage(
                    [new ContentBlock(ContentBlockType.TEXT, undefined, 'Hello')],
                    Role.USER
                )
            ];
            const chatRequest = ChatRequest.builder()
                .withModel(AnthropicModel.CLAUDE_3_HAIKU)
                .withMessages(messages)
                .withMaxTokens(1000)
                .withStream(true)
                .build();

            try {
                await anthropicAPI.chat(chatRequest);
                expect.fail('Should have thrown an error');
            } catch (e) {
                expect(e.message).to.equal('Request must set the stream property to false.');
            }
        });
    });

    describe('streamingChat', () => {
        it('should return an Observable of ResponseEntity with ChatResponse', async () => {
            const messages = [
                new AnthropicMessage(
                    [new ContentBlock(ContentBlockType.TEXT, undefined, 'Hello')],
                    Role.USER
                )
            ];
            const chatRequest = ChatRequest.builder()
                .withModel(AnthropicModel.CLAUDE_3_HAIKU)
                .withMessages(messages)
                .withMaxTokens(1000)
                .withStream(true)
                .build();

            const response$ = await anthropicAPI.streamingChat(chatRequest);
            response$.subscribe({
                next: response => {
                    expect(response.status).to.equal(200);
                    expect(response.headers).to.deep.include({ 'content-type': 'text/event-stream' });
                    expect(response.body).to.be.instanceOf(ChatResponse);
                    expect(response.body.model).to.equal(AnthropicModel.CLAUDE_3_HAIKU);
                }
            });
        });

        it('should throw an error if stream mode is disabled', async () => {
            const messages = [
                new AnthropicMessage(
                    [new ContentBlock(ContentBlockType.TEXT, undefined, 'Hello')],
                    Role.USER
                )
            ];
            const chatRequest = ChatRequest.builder()
                .withModel(AnthropicModel.CLAUDE_3_HAIKU)
                .withMessages(messages)
                .withMaxTokens(1000)
                .withStream(false)
                .build();

            try {
                await anthropicAPI.streamingChat(chatRequest);
                expect.fail('Should have thrown an error');
            } catch (e) {
                expect(e.message).to.equal('Request must set the stream property to true.');
            }
        });
    });
});
