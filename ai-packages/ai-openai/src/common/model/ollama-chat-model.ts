import {
    AssistantMessage,
    ChatGenerationMetadata, 
    ChatModel,
    ChatResponse,
    ChatResponseMetadata,
    Generation,
    Prompt,
    SystemMessage,
    ToolCall,
    ToolResponseMessage,
    UserMessage
} from '@celljs/ai-core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    ChatRequest as OllamaChatRequest,
    ChatResponse as OllamaChatResponse, 
    Message as OllamaMessage,
    Role,
    ToolCall as OllamaToolCall,
    ToolCallFunction,
    OllamaOptions,
    ChatRequestBuilder as OllamaChatRequestBuilder,
    OllamaAPI
} from '../api';
import { Autowired, ByteUtil, Component, IllegalArgumentError } from '@celljs/core';

/**
 * {@link ChatModel} implementation for {@literal Ollama}
 * backed by {@link OllamaAPI}.
 * 
 * @author Yang Subo
 * @see ChatModel
 * @see OllamaAPI
 */
@Component(ChatModel)
export class OllamaChatModel implements ChatModel {

    /**
     * The default options used for the chat completion requests.
     */
    @Autowired(OllamaOptions)
    protected readonly defaultOptions: OllamaOptions;

    /**
     * Low-level access to the Ollama API.
     */
    @Autowired(OllamaAPI) 
    protected readonly chatApi: OllamaAPI;

    /**
     * Creates a model response for the given chat conversation.
     * @param prompt - The chat completion request.
     * @returns A promise that resolves to the chat completion response.
     */
    public async call(prompt: Prompt): Promise<ChatResponse> {
        const request: OllamaChatRequest = this.parseOllamaChatRequest(prompt, false);

        const ollamaResponse: OllamaChatResponse = await this.chatApi.chat(request);

        const toolCalls: ToolCall[] = [];
        if (ollamaResponse.message.toolCalls) {
            for (const toolCall of ollamaResponse.message.toolCalls) {
                toolCalls.push({
                    id: '',
                    type: 'function',
                    name: toolCall.function.name,
                    arguments: JSON.stringify(toolCall.function.arguments)
                });
            }
        }

        const assistantMessage: AssistantMessage = new AssistantMessage(
            ollamaResponse.message.content,
            [],
            toolCalls
        );

        let generationMetadata: ChatGenerationMetadata = ChatGenerationMetadata.EMPTY;
        if (ollamaResponse.promptEvalCount !== undefined && ollamaResponse.evalCount !== undefined) {
            generationMetadata = ChatGenerationMetadata.from(ollamaResponse.doneReason, undefined);
        }

        const generator: Generation = {
            output: assistantMessage,
            metadata: generationMetadata
        };

        return {
            result: generator,
            results: [generator], 
            metadata: this.parseChatResponseMetadata(ollamaResponse)
        };
    }

    /**
     * Creates a streaming chat response for the given chat conversation.
     * @param prompt - The chat completion request.
     * @returns A promise that resolves to an observable of chat completion responses.
     */
    async stream(prompt: Prompt): Promise<Observable<ChatResponse>> {
        const request: OllamaChatRequest = this.parseOllamaChatRequest(prompt, true);
        const ollamaResponse = await this.chatApi.streamingChat(request);

        return ollamaResponse.pipe(
            map(chunk => {
                const content = chunk.message.content ?? '';
                const toolCalls = chunk.message.toolCalls?.map(toolCall => ({
                    id: '',
                    type: 'function',
                    name: toolCall.function.name,
                    arguments: JSON.stringify(toolCall.function.arguments)
                })) ?? [];

                const assistantMessage: AssistantMessage = new AssistantMessage(
                    content,
                    [],
                    toolCalls
                );

                let generationMetadata = ChatGenerationMetadata.EMPTY;
                if (chunk.promptEvalCount && chunk.evalCount) {
                    generationMetadata = ChatGenerationMetadata.from(chunk.doneReason);
                }

                const generator = {
                    output: assistantMessage,
                    metadata: generationMetadata
                };

                return <ChatResponse>{
                    result: generator,
                    results: [generator],
                    metadata: this.parseChatResponseMetadata(chunk)
                };
            })
        );
    }

    /**
     * Parse Ollama chat response into ChatResponseMetadata.
     * @param response - The Ollama chat response
     * @returns ChatResponseMetadata containing usage and other metadata 
     */
    protected parseChatResponseMetadata(response: OllamaChatResponse): ChatResponseMetadata {
        const promptTokens = response.promptEvalCount ?? 0;
        const generationTokens = response.evalCount ?? 0;
        const totalTokens = promptTokens + generationTokens;

        return {
            id: '',
            model: response.model,
            rateLimit: ChatResponseMetadata.EMPTY.rateLimit,
            usage: {
                promptTokens,
                generationTokens,
                totalTokens
            },
            promptMetadata: ChatResponseMetadata.EMPTY.promptMetadata,
            extra: {
                'eval-count': response.evalCount,
                'load-duration': response.loadDuration,
                'prompt_eval_duration': response.promptEvalDuration,
                'prompt_eval_count': response.promptEvalCount,
                'total_duration': response.totalDuration,
                'done': response.done
            }
        };
    }

    /**
     * Generates an Ollama chat request from a given prompt.
     * @param prompt - The prompt containing instructions and messages.
     * @param stream - Indicates whether the response should be streamed.
     * @returns An instance of OllamaApi.ChatRequest. 
     * @throws Will throw an error if the model is not set.
     */
    protected parseOllamaChatRequest(prompt: Prompt, stream: boolean): OllamaChatRequest {
        const ollamaMessages: OllamaMessage[] = prompt.instructions.map(message => {
            if (message instanceof UserMessage) {
                const messageBuilder = OllamaMessage.builder(Role.USER).withContent(message.content);
                if (message.media && message.media.length > 0) {
                    messageBuilder.withImages(
                        message.media.map(media => this.fromMediaData(media.data))
                    );
                }
                return [messageBuilder.build()];
            } else if (message instanceof SystemMessage) {
                return [OllamaMessage.builder(Role.SYSTEM).withContent(message.content).build()];
            } else if (message instanceof AssistantMessage) {
                let toolCalls: OllamaToolCall[] = [];
                if (message.toolCalls.length > 0) {
                    toolCalls = message.toolCalls.map(toolCall => {
                        const func = new ToolCallFunction(toolCall.name, JSON.parse(toolCall.arguments));
                        return new OllamaToolCall(func);
                    });
                }
                return [
                    OllamaMessage.builder(Role.ASSISTANT)
                        .withContent(message.content)
                        .withToolCalls(toolCalls)
                        .build()
                ];
            } else if (message instanceof ToolResponseMessage) {
                return message.responses.map(tr =>
                    OllamaMessage.builder(Role.TOOL).withContent(tr.responseData).build()
                );
            }
            throw new IllegalArgumentError(`Unsupported message type: ${message.messageType}`);
        }).flat();

        const functionsForThisRequest: Set<string> = new Set();

        // Runtime options 
        let runtimeOptions: OllamaOptions | undefined = undefined;
        if (prompt.options) {
            runtimeOptions = Object.assign(OllamaOptions.builder().build(), prompt.options);
        }

        if (this.defaultOptions.functions.size > 0) {
            this.defaultOptions.functions.forEach(func => functionsForThisRequest.add(func));
        }

        const ollamaOptions: OllamaOptions = runtimeOptions ?? this.defaultOptions;

        // Override the model.
        if (!ollamaOptions.model) {
            throw new IllegalArgumentError('Model is not set!');
        }

        const model = ollamaOptions.model;
        const requestBuilder: OllamaChatRequestBuilder = OllamaChatRequest.builder(model)
            .withStream(stream)
            .withMessages(ollamaMessages)
            .withOptions(ollamaOptions);

        if (ollamaOptions.format) {
            requestBuilder.withFormat(ollamaOptions.format);
        }

        if (ollamaOptions.keepAlive) {
            requestBuilder.withKeepAlive(ollamaOptions.keepAlive);
        }

        return requestBuilder.build();
    }

    /**
     * Helper method to convert media data to Base64 string format.
     * @param mediaData - The media data to convert
     * @returns Base64 encoded string
     */
    private fromMediaData(mediaData?: Buffer): string {
        if (typeof mediaData === 'string') {
            return mediaData;
        }
        return ByteUtil.encodeBase64(mediaData);
    }

}
