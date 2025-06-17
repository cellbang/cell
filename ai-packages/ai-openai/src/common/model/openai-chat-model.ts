import {
    AssistantMessage,
    ChatGenerationMetadata,
    ChatModel,
    ChatResponse,
    ChatResponseMetadata,
    FunctionCallbackRegister,
    FunctionCallingOptions,
    Generation,
    Media,
    MessageType,
    Prompt,
    RateLimit,
    SystemMessage,
    ToolResponseMessage,
    UsageUtil,
    Usage,
    UserMessage,
    ToolHandler,
    PromptTemplate
} from '@celljs/ai-core';
import { Observable, of } from 'rxjs';
import { map, bufferCount, mergeMap, concatAll } from 'rxjs/operators';
import {
    ChatCompletionRequest,
    ChatCompletion,
    ChatCompletionMessage,
    Role,
    ToolCall as OpenAIToolCall,
    OpenAIAPI,
    Choice,
    MediaContent,
    Format,
    AudioOutput,
    Function,
    FunctionTool,
    OutputModality,
    ChatCompletionChunk,
    ChatCompletionFinishReason
} from '../api';
import { Autowired, ByteUtil, Component, IllegalArgumentError, Logger, MimeTypeUtils, MimeType } from '@celljs/core';
import { OpenAIChatOptions } from './openai-chat-options';
import { OpenAIResponseHeaderExtractor } from '../support';

/**
 * {@link ChatModel} implementation for {@literal OpenAI}
 * backed by {@link OpenAIAPI}.
 */
@Component(ChatModel)
export class OpenAIChatModel implements ChatModel {

    /**
     * The default options used for the chat completion requests.
     */
    @Autowired(OpenAIChatOptions)
    protected readonly defaultOptions: OpenAIChatOptions;

    /**
     * Low-level access to the OpenAI API.
     */
    @Autowired(OpenAIAPI)
    protected readonly chatApi: OpenAIAPI;

    @Autowired(Logger)
    protected readonly logger: Logger;

    @Autowired(FunctionCallbackRegister)
    protected readonly functionCallbackRegister: FunctionCallbackRegister;

    @Autowired(ToolHandler)
    protected readonly toolHandler: ToolHandler;

    @Autowired(PromptTemplate)
    protected readonly promptTemplate: PromptTemplate;

    protected fromAudioData(audioData: any): string {
        if (audioData instanceof Uint8Array) {
            return ByteUtil.encodeBase64(audioData);
        } else {
            throw new IllegalArgumentError(`Unsupported audio data type: ${audioData.constructor.name}`);
        }
    }

    protected fromMediaData(mimeType: MimeType, mediaContentData: any): string {
        if (mediaContentData instanceof Uint8Array) {
            return `data:${mimeType.toString()};base64,${ByteUtil.encodeBase64(mediaContentData)}`;
        } else if (typeof mediaContentData === 'string') {
            return mediaContentData;
        } else {
            throw new IllegalArgumentError(`Unsupported media data type: ${mediaContentData.constructor.name}`);
        }
    }

    protected mapToMediaContent(media: Media): MediaContent {
        const mimeType = media.mimeType.toString();
        if (mimeType === 'audio/mp3') {
            return MediaContent.createInputAudio(this.fromAudioData(media.data), Format.MP3);
        }
        if (mimeType === 'audio/wav') {
            return MediaContent.createInputAudio(this.fromAudioData(media.data), Format.WAV);
        } else {
            return MediaContent.createImageUrl(this.fromMediaData(media.mimeType, media.data));
        }
    }

    protected getFunctionTools(functionNames: Set<string>): FunctionTool[] {
        return this.functionCallbackRegister.resolve(Array.from(functionNames)).map(functionCallback => {
            const func = Function.create(functionCallback.description, functionCallback.name, JSON.parse(functionCallback.inputTypeSchema));
            return FunctionTool.create(func);
        });
    }

    protected createRequest(prompt: Prompt, stream: boolean): ChatCompletionRequest {
        const chatCompletionMessages = prompt.instructions.map(message => {
            if (message instanceof UserMessage || message instanceof SystemMessage) {
                let content: any = message.content;
                if (message instanceof UserMessage) {
                    if (message.media?.length > 0) {
                        const contentList = [MediaContent.createText(message.content), ...message.media.map(media => this.mapToMediaContent(media))];
                        content = contentList;
                    }
                }
                const role = message.messageType === MessageType.USER ? Role.USER : Role.SYSTEM;
                return ChatCompletionMessage.create(content, role);
            } else if (message instanceof AssistantMessage) {
                const assistantMessage = message;
                let toolCalls: OpenAIToolCall[] = [];
                if (assistantMessage.toolCalls.length > 0) {
                    toolCalls = assistantMessage.toolCalls.map(toolCall => ({
                        id: toolCall.id,
                        type: 'function',
                        function: {
                            name: toolCall.name,
                            arguments: toolCall.arguments
                        }
                    }));
                }
                let audioOutput: AudioOutput | undefined;
                if (assistantMessage.media.length > 0) {
                    if (assistantMessage.media.length !== 1) {
                        throw new IllegalArgumentError('Only one media content is supported for assistant messages');
                    }
                    const media = assistantMessage.media[0];
                    audioOutput = AudioOutput.create(media.id);
                }
                const chatCompletionMessage = ChatCompletionMessage.create(assistantMessage.content, Role.ASSISTANT);
                chatCompletionMessage.toolCalls = toolCalls;
                chatCompletionMessage.audioOutput = audioOutput;
                return chatCompletionMessage;
            } else if (message instanceof ToolResponseMessage) {
                message.responses.forEach(response => {
                    if (!response.id) {
                        throw new IllegalArgumentError('ToolResponseMessage must have an id');
                    }
                });
                return message.responses.map(tr => {
                    const chatCompletionMessage = ChatCompletionMessage.create(tr.responseData, Role.TOOL);
                    chatCompletionMessage.name = tr.name;
                    chatCompletionMessage.toolCallId = tr.id;
                    return chatCompletionMessage;
                });
            } else {
                throw new IllegalArgumentError(`Unsupported message type: ${message.messageType}`);
            }
        }).flat();

        let request = new ChatCompletionRequest();
        request.messages = chatCompletionMessages;
        request.stream = stream;

        // Runtime options
        let runtimeOptions: OpenAIChatOptions = OpenAIChatOptions.builder().build();
        if (prompt.options) {
            runtimeOptions = Object.assign(runtimeOptions, prompt.options);
        }

        const enabledToolsToUse = FunctionCallingOptions.getEnabledFunctionsToCall(runtimeOptions);

        if (this.defaultOptions.functions.size > 0) {
            for (const functionName of this.defaultOptions.functions) {
                enabledToolsToUse.add(functionName);
            }
        }

        runtimeOptions = Object.assign(this.defaultOptions, runtimeOptions);
        request = Object.assign(request, runtimeOptions);

        if (enabledToolsToUse.size > 0) {
            request.tools = this.getFunctionTools(enabledToolsToUse);
        }

        // Remove `streamOptions` from the request if it is not a streaming request
        if (request.streamOptions && !stream) {
            request.streamOptions = undefined;
        }
        return request;
    }

    protected buildGeneration(choice: Choice, metadata: Record<string, any>, request: ChatCompletionRequest): Generation {
        const toolCalls = choice.message.toolCalls?.map(toolCall => ({
            id: toolCall.id ?? '',
            type: 'function',
            name: toolCall.function.name,
            arguments: JSON.stringify(toolCall.function.arguments)
        })) ?? [];

        const finishReason = choice.finishReason ?? '';
        const generationMetadata = ChatGenerationMetadata.from(finishReason);

        const media: Media[] = [];
        let textContent = choice.message.content;
        const audioOutput = choice.message.audioOutput;
        if (audioOutput) {
            const mimeType = `audio/${request.audioParameters?.format?.toLowerCase()}`;
            const audioData = ByteUtil.decodeBase64(audioOutput.data);
            media.push({
                mimeType: MimeTypeUtils.parseMimeType(mimeType),
                data: audioData,
                id: audioOutput.id
            });
            if (!textContent) {
                textContent = audioOutput.transcript;
            }
            generationMetadata.metadata.audioId = audioOutput.id;
            generationMetadata.metadata.audioExpiresAt = audioOutput.expiresAt;
        }

        const assistantMessage = new AssistantMessage(textContent, media, metadata, toolCalls);
        return {
            output: assistantMessage,
            metadata: generationMetadata
        };
    }

    protected buildChatResponseMetadataByResult(result: ChatCompletion, usage: Usage, rateLimit: RateLimit = RateLimit.createEmpty()): ChatResponseMetadata {
        return ChatResponseMetadata.builder()
            .id(result.id ?? '')
            .usage(usage)
            .model(result.model ?? '')
            .keyValue('created', result.created ?? 0)
            .keyValue('system-fingerprint', result.systemFingerprint ?? '')
            .rateLimit(rateLimit)
            .build();
    }

    protected buildChatResponseMetadata(chatResponseMetadata: ChatResponseMetadata, usage: Usage): ChatResponseMetadata {
        return ChatResponseMetadata.builder()
            .id(chatResponseMetadata.id ?? '')
            .usage(usage)
            .model(chatResponseMetadata.model ?? '')
            .rateLimit(chatResponseMetadata.rateLimit)
            .build();
    }

    call(prompt: Prompt): Promise<ChatResponse> {
        return this.internalCall(prompt);
    }

    protected async internalCall(prompt: Prompt, previousChatResponse?: ChatResponse): Promise<ChatResponse> {
        const request = this.createRequest(prompt, false);
        const httpHeaders = prompt.options?.httpHeaders;
        const completionEntity = await this.chatApi.chat(request, httpHeaders);
        const chatCompletion = completionEntity.body;
        if (!chatCompletion) {
            this.logger.warn(`No chat completion returned for prompt: ${prompt}`);
            return ChatResponse.from([]);
        }
        const choices = chatCompletion.choices;
        if (!choices || choices.length === 0) {
            this.logger.warn(`No choices returned for prompt: ${prompt}`);
            return ChatResponse.from([]);
        }
        const generations = choices.map(choice => {
            const metadata = {
                id: chatCompletion.id ?? '',
                role: choice.message.role ?? '',
                index: choice.index,
                finishReason: choice.finishReason ?? '',
                refusal: choice.message.refusal ?? ''
            };
            return this.buildGeneration(choice, metadata, request);
        });
        const rateLimit = OpenAIResponseHeaderExtractor.extractAIResponseHeaders(completionEntity);
        const usage = chatCompletion.usage ?? {};
        const chatResponse = ChatResponse.from(generations, this.buildChatResponseMetadataByResult(chatCompletion, usage, rateLimit));
        if (FunctionCallingOptions.isProxyToolCalls(prompt.options, this.defaultOptions)) {
            if (ChatResponse.isToolCall(chatResponse, new Set([ChatCompletionFinishReason.TOOL_CALLS, ChatCompletionFinishReason.STOP]))) {
                const toolCallConversation = await this.toolHandler.handle(prompt, chatResponse);
                return this.internalCall(await this.promptTemplate.create(toolCallConversation, { chatOptions: prompt.options }), chatResponse);
            }
        }
        return chatResponse;
    }

    protected chunkToChatCompletion(chunk: ChatCompletionChunk): ChatCompletion {
        const choices = chunk.choices.map(chunkChoice => {
            const choice = new Choice();
            choice.finishReason = chunkChoice.finishReason;
            choice.index = chunkChoice.index;
            choice.message = chunkChoice.delta;
            choice.logprobs = chunkChoice.logprobs;
            return choice;
        });
        const chatCompletion = new ChatCompletion();
        chatCompletion.id = chunk.id;
        chatCompletion.choices = choices;
        chatCompletion.created = chunk.created;
        chatCompletion.model = chunk.model;
        chatCompletion.serviceTier = chunk.serviceTier;
        chatCompletion.systemFingerprint = chunk.systemFingerprint;
        chatCompletion.usage = chunk.usage;
        return chatCompletion;
    }

    protected async internalStream(prompt: Prompt, previousChatResponse?: ChatResponse): Promise<Observable<ChatResponse>> {
        const request = this.createRequest(prompt, true);
        if (request.outputModalities?.includes(OutputModality.AUDIO)) {
            this.logger.warn('Audio output is not supported for streaming requests. Removing audio output.');
            throw new IllegalArgumentError('Audio output is not supported for streaming requests.');
        }

        if (request.audioParameters) {
            this.logger.warn('Audio parameters are not supported for streaming requests. Removing audio parameters.');
            throw new IllegalArgumentError('Audio parameters are not supported for streaming requests.');
        }
        const httpHeaders = prompt.options?.httpHeaders;
        const response = await this.chatApi.streamingChat(request, httpHeaders);

        // For chunked responses, only the first chunk contains the choice role.
        // Subsequent chunks contain the choices.
        const roleMap = new Map<string, string>();

        const chatResponse = response.pipe(
            map(responseEntity => this.chunkToChatCompletion(responseEntity.body)),
            map(chatCompletion => {
                try {
                    const generations = chatCompletion.choices.map(choice => {
                        const id = chatCompletion.id ?? '';
                        if (choice.message.role) {
                            roleMap.set(id, choice.message.role);
                        }
                        const metadata = {
                            id,
                            role: roleMap.get(id) ?? '',
                            index: choice.index,
                            finishReason: choice.finishReason ?? '',
                            refusal: choice.message.refusal ?? ''
                        };
                        return this.buildGeneration(choice, metadata, request);
                    });
                    const usage = chatCompletion.usage;
                    const currentChatResponseUsage = usage ? Usage.from(usage.promptTokens, usage.completionTokens, usage.totalTokens) : Usage.createEmpty();
                    const accumulatedUsage = UsageUtil.getCumulativeUsage(currentChatResponseUsage, previousChatResponse);
                    return ChatResponse.from(generations, this.buildChatResponseMetadataByResult(chatCompletion, accumulatedUsage));
                } catch (e) {
                    this.logger.error(e);
                    return ChatResponse.from([]);
                }
            }),
            // When in stream mode and enabled to include the usage, the OpenAI
            // Chat completion response would have the usage set only in its
            // final response. Hence, the following overlapping buffer is
            // created to store both the current and the subsequent response
            // responses.
            bufferCount(2, 1),
            map(buffer => {
                const firstResponse = buffer[0];
                if (request.streamOptions?.includeUsage && buffer.length === 2) {
                    const secondResponse = buffer[1];
                    if (secondResponse?.metadata) {
                        // If the second response is not empty, then the first
                        // response is not the final response.
                        const usage = secondResponse.metadata.usage;
                        if (!UsageUtil.isEmpty(usage)) {
                            // Store the usage from the final response to the
                            // penultimate response for accumulation.
                            return ChatResponse.from(firstResponse.results, this.buildChatResponseMetadata(firstResponse.metadata, usage));
                        }
                    }
                }
                return firstResponse;
            }),
            mergeMap(async chatResponse2 => {
                if (FunctionCallingOptions.isProxyToolCalls(prompt.options, this.defaultOptions)) {
                    if (ChatResponse.isToolCall(chatResponse2, new Set([ChatCompletionFinishReason.TOOL_CALLS, ChatCompletionFinishReason.STOP]))) {
                        const toolCallConversation = await this.toolHandler.handle(prompt, chatResponse2);
                        return this.internalStream(await this.promptTemplate.create(toolCallConversation, { chatOptions: prompt.options }), chatResponse2);
                    }
                }
                return of(chatResponse2);
            }),
            concatAll()
        );
        return chatResponse;
    }

    async stream(prompt: Prompt): Promise<Observable<ChatResponse>> {
        return this.internalStream(prompt);
    }
}
