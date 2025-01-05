import {
    AssistantMessage,
    ChatGenerationMetadata,
    ChatModel,
    ChatResponse,
    ChatResponseMetadata,
    FunctionCallback,
    Generation,
    Media,
    MessageType,
    Prompt,
    ToolCall,
    ToolResponseMessage,
    Usage,
    UserMessage
} from '@celljs/ai-core';
import { Autowired, Component, IllegalArgumentError, Logger } from '@celljs/core';
import { Observable } from 'rxjs';
import { AnthropicAPI, ChatResponse as AnthriopicChatResponse, AnthropicMessage, ChatRequest, ContentBlock, ContentBlockType, Role, Source, Tool } from '../api';
import { AnthropicChatOptions } from './anthropic-chat-options';
import { map } from 'rxjs/operators';

@Component(ChatModel)
export class AnthropicChatModel implements ChatModel {
    @Autowired(AnthropicChatOptions)
    protected readonly defaultOptions: AnthropicChatOptions;

    @Autowired(AnthropicAPI)
    protected readonly chatApi: AnthropicAPI;

    @Autowired(Logger)
    protected readonly logger: Logger;

    protected getContentBlockTypeByMedia(media: Media): ContentBlockType {
        if (media.mediaType.startsWith('image')) {
            return ContentBlockType.IMAGE;
        } else if (media.mediaType.startsWith('pdf')) {
            return ContentBlockType.DOCUMENT;
        }
        throw new IllegalArgumentError(`Unsupported media type: ${media.mediaType}. Supported types are: images (image/*) and PDF documents (application/pdf)`);
    }

    protected fromMediaData(mediaData: any): string {
        if (mediaData instanceof Uint8Array) {
            return btoa(String.fromCharCode(...mediaData));
        } else if (typeof mediaData === 'string') {
            return mediaData;
        } else {
            throw new IllegalArgumentError(`Unsupported media data type: ${typeof mediaData}`);
        }
    }

    protected resolveFunctionCallbacks(functions: Set<string>): FunctionCallback[] {
        return [];
    }

    protected getFunctionTools(functions: Set<string>): Tool[] {
        return this.resolveFunctionCallbacks(functions).map(func => new Tool(func.name, func.description, JSON.parse(func.inputTypeSchema)));
    }

    protected createRequest(prompt: Prompt, stream: boolean): ChatRequest {
        const userMessages = prompt.instructions
            .filter(message => message.messageType !== MessageType.SYSTEM)
            .map(message => {
                if (message.messageType === MessageType.USER) {
                    const contents = [new ContentBlock(ContentBlockType.TEXT, undefined, message.content)];
                    if (message instanceof UserMessage) {
                        if (message.media.length > 0) {
                            const mediaContent = message.media.map(media => {
                                const contentBlockType = this.getContentBlockTypeByMedia(media);
                                const source = new Source('base64', media.mediaType, this.fromMediaData(media.data));
                                return new ContentBlock(contentBlockType, source);
                            });
                            contents.push(...mediaContent);
                        }
                    }
                    return new AnthropicMessage(contents, message.messageType === MessageType.USER ? Role.USER : Role.ASSISTANT);
                } else if (message.messageType === MessageType.ASSISTANT) {
                    const assistantMessage = message as AssistantMessage;
                    const contentBlocks = [];
                    if (message.content) {
                        contentBlocks.push(new ContentBlock(ContentBlockType.TEXT, undefined, message.content));
                    }
                    if (assistantMessage.toolCalls.length > 0) {
                        for (const toolCall of assistantMessage.toolCalls) {
                            contentBlocks.push(
                                new ContentBlock(ContentBlockType.TOOL_USE, undefined, undefined, undefined, toolCall.id, toolCall.name, JSON.parse(toolCall.arguments))
                            );
                        }
                    }
                    return new AnthropicMessage(contentBlocks, Role.ASSISTANT);
                } else if (message.messageType === MessageType.TOOL) {
                    const toolResponses = (message as ToolResponseMessage).responses.map(
                        toolResponse => new ContentBlock(ContentBlockType.TOOL_RESULT, undefined, undefined, undefined, toolResponse.id, toolResponse.responseData)
                    );
                    return new AnthropicMessage(toolResponses, Role.USER);
                } else {
                    throw new IllegalArgumentError(`Unsupported message type: ${message.messageType}`);
                }
            });

        const systemPrompt = prompt.instructions
            .filter(m => m.messageType === MessageType.SYSTEM)
            .map(m => m.content)
            .join('\n');

        let request = new ChatRequest(this.defaultOptions.model, userMessages, systemPrompt, this.defaultOptions.maxTokens, this.defaultOptions.temperature, stream);

        if (prompt.options) {
            request = Object.assign(request, prompt.options);
        }

        const functionsForThisRequest: Set<string> = new Set();

        if (this.defaultOptions.functions.size > 0) {
            this.defaultOptions.functions.forEach(func => functionsForThisRequest.add(func));
        }

        if (functionsForThisRequest.size > 0) {
            const tools = this.getFunctionTools(functionsForThisRequest);
            request.tools = tools;
        }

        return request;
    }

    protected from(response: AnthriopicChatResponse): ChatResponseMetadata {
        return ChatResponseMetadata.builder()
            .id(response.id)
            .model(response.model)
            .usage(Usage.from(response.usage.inputTokens, response.usage.outputTokens))
            .keyValue('stop-reason', response.stopReason)
            .keyValue('stop-sequence', response.stopSequence)
            .keyValue('type', response.type)
            .build();
    }

    protected toChatResponse(response?: AnthriopicChatResponse): ChatResponse {
        if (response === undefined) {
            this.logger.warn('Null chat completion returned');
            return ChatResponse.from([]);
        }

        const generations = response.content
            .filter(content => content.type !== ContentBlockType.TOOL_USE)
            .map(content => Generation.from(new AssistantMessage(content.text), ChatGenerationMetadata.from(response.stopReason)));

        const allGenerations = [...generations];

       if (response.stopReason && generations.length === 0) {
           const generation = Generation.from(new AssistantMessage(), ChatGenerationMetadata.from(response.stopReason));
           allGenerations.push(generation);
       }

       const toolToUseList = response.content.filter(c => c.type === ContentBlockType.TOOL_USE);
       if (toolToUseList.length > 0) {
            const toolCalls: ToolCall[] = [];
            for (const toolToUse of toolToUseList) {
                toolCalls.push({
                    id: toolToUse.id!,
                    type: 'function',
                    name: toolToUse.name!,
                    arguments: JSON.stringify(toolToUse.input)
                });
            }

            const assistantMessage = new AssistantMessage('', [], {}, toolCalls);
            const toolCallGeneration = Generation.from(assistantMessage, ChatGenerationMetadata.from(response.stopReason));
            allGenerations.push(toolCallGeneration);
        }

        return ChatResponse.from(allGenerations, this.from(response));
    }

    async call(prompt: Prompt): Promise<ChatResponse> {
        const request = this.createRequest(prompt, false);
        const chatResponse = await this.chatApi.chat(request);
        return this.toChatResponse(chatResponse);
    }

    async stream(prompt: Prompt): Promise<Observable<ChatResponse>> {
        const request = this.createRequest(prompt, true);
        const chatResponse = await this.chatApi.streamingChat(request);
        return chatResponse.pipe(map(chunk => this.toChatResponse(chunk)));
    }

}
