import {
    AssistantMessage,
    ChatGenerationMetadata,
    ChatModel,
    ChatResponse,
    ChatResponseMetadata,
    Generation,
    Prompt,
    RateLimit,
    SystemMessage,
    ToolCall,
    ToolResponseMessage,
    UserMessage } from '@celljs/ai-core';
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
import { instanceToPlain } from 'class-transformer';

@Component(ChatModel)
export class OllamaChatModel implements ChatModel {

    @Autowired(OllamaOptions)
    protected readonly defaultOptions: OllamaOptions;

    @Autowired(OllamaAPI)
    protected readonly chatApi: OllamaAPI;

    public async call(prompt: Prompt): Promise<ChatResponse> {
        const request: OllamaChatRequest = this.parseOllamaChatRequest(prompt, false);
        const { body: ollamaResponse } = await this.chatApi.chat(request);

        const toolCalls: ToolCall[] = [];
        for (const toolCall of ollamaResponse.message.toolCalls ?? []) {
            toolCalls.push({
                id: '',
                type: 'function',
                name: toolCall.function.name,
                arguments: JSON.stringify(toolCall.function.arguments)
            });
        }

        const assistantMessage: AssistantMessage = new AssistantMessage(
            ollamaResponse.message.content,
            [],
            toolCalls
        );

        let generationMetadata: ChatGenerationMetadata = ChatGenerationMetadata.from();
        if (ollamaResponse.promptEvalCount !== undefined && ollamaResponse.evalCount !== undefined) {
            generationMetadata = ChatGenerationMetadata.from(ollamaResponse.doneReason, undefined);
        }

        const generator: Generation = {
            output: assistantMessage,
            metadata: generationMetadata
        };
        const chatResponse: ChatResponse = {
            result: generator,
            results: [generator],
            metadata: this.parseChatResponseMetadata(ollamaResponse)
        };

        return chatResponse;
    }
    async stream(prompt: Prompt): Promise<Observable<ChatResponse>> {
        const request: OllamaChatRequest = this.parseOllamaChatRequest(prompt, true);
        const ollamaResponse = await this.chatApi.streamingChat(request);
        const chatResponse = ollamaResponse.pipe(
            map(({ body: chunk }) => {
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
                let generationMetadata = ChatGenerationMetadata.from();
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
        return chatResponse;

    }

    protected parseChatResponseMetadata(response: OllamaChatResponse): ChatResponseMetadata {

        const promptTokens = response.promptEvalCount ?? 0;
        const generationTokens = response.evalCount ?? 0;
        const totalTokens = promptTokens + generationTokens;
        return {
            ...ChatResponseMetadata.createEmpty(),
            model: response.model,
            rateLimit: RateLimit.createEmpty(),
            usage: {
                promptTokens,
                generationTokens,
                totalTokens
            },
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
     *
     * @param prompt The prompt containing instructions and messages.
     * @param stream Indicates whether the response should be streamed.
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
            .withOptions(instanceToPlain(ollamaOptions));

        if (ollamaOptions.format) {
            requestBuilder.withFormat(ollamaOptions.format);
        }

        if (ollamaOptions.keepAlive) {
            requestBuilder.withKeepAlive(ollamaOptions.keepAlive);
        }

        // Add the enabled functions definitions to the request's tools parameter.
        // if (functionsForThisRequest.size > 0) {
        //     requestBuilder.withTools(this.getFunctionTools([...functionsForThisRequest]));
        // }

        return requestBuilder.build();
    }

    private fromMediaData(mediaData?: Buffer): string {
        if (typeof mediaData === 'string') {
            return mediaData;
        } else {
            return ByteUtil.encodeBase64(mediaData);
        }
    }

}
