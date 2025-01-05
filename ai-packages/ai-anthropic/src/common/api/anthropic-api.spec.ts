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
                if (data.stream) {
                    const chatResponse = {
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
                    const steam = new ReadableStream({
                        start(controller) {
                            controller.enqueue('data: ' + JSON.stringify({
                                type: 'message_start',
                                data: chatResponse
                            }) + '\n\n');
                            controller.close();
                        }
                    });
                    return { data: steam };
                }

                return {
                    data: {
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
                    }
                };
            }
        });
        anthropicAPI = container.get(AnthropicAPI);
    });

    describe('chat', () => {
        it('should return a ChatResponse', async () => {
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
            expect(response).to.be.instanceOf(ChatResponse);
            expect(response.model).to.equal(AnthropicModel.CLAUDE_3_HAIKU);
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
        it('should return an Observable of ChatResponse', async () => {
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
                    expect(response).to.be.instanceOf(ChatResponse);
                    expect(response.model).to.equal(AnthropicModel.CLAUDE_3_HAIKU);
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
