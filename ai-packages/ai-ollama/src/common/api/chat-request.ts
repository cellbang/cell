import { Type, Expose, instanceToPlain } from 'class-transformer';
import { Message } from './message';
import { OllamaOptions } from './ollama-options';
import { Assert } from '@celljs/core';

/**
 * Function definition.
 *
 * @param name The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes.
 * @param description A description of what the function does, used by the model to choose when and how to call
 * the function.
 * @param parameters The parameters the functions accepts, described as a JSON Schema object. To describe a
 * function that accepts no parameters, provide the value {"type": "object", "properties": {}}.
 */
export class FunctionDefinition {
    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    parameters: Record<string, any>;

    constructor(description: string, name: string, jsonSchema: string) {
        this.description = description;
        this.name = name;
        this.parameters = JSON.parse(jsonSchema);
    }
}

/**
 * Represents a tool the model may call. Currently, only functions are supported as a tool.
 *
 * @param type The type of the tool. Currently, only 'function' is supported.
 * @param function The function definition.
 */
export class Tool {
    @Expose()
    type: ToolType;

    @Expose()
    @Type(() => FunctionDefinition)
    function: FunctionDefinition;

    constructor(type: ToolType, func: FunctionDefinition) {
        this.type = type;
        this.function = func;
    }
}

export enum ToolType {
    /**
     * Function tool type.
     */
    FUNCTION = 'function',
}

/**
 * Chat request object.
 *
 * @param model The model to use for completion. It should be a name familiar to Ollama from the [Library](https://ollama.com/library).
 * @param messages The list of messages in the chat. This can be used to keep a chat memory.
 * @param stream Whether to stream the response. If false, the response will be returned as a single response object rather than a stream of objects.
 * @param format The format to return the response in. Currently, the only accepted value is "json".
 * @param keepAlive Controls how long the model will stay loaded into memory following this request (default: 5m).
 * @param tools List of tools the model has access to.
 * @param options Model-specific options. For example, "temperature" can be set through this field, if the model supports it.
 * You can use the `OllamaOptions` builder to create the options then `OllamaOptions.toMap()` to convert the options into a map.
 *
 * @see [Chat Completion API](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion)
 * @see [Ollama Types](https://github.com/ollama/ollama/blob/main/api/types.go)
 */
export class ChatRequest {
    @Expose()
    model: string;

    @Expose()
    @Type(() => Message)
    messages: Message[];

    @Expose()
    stream: boolean;

    @Expose()
    format: string;

    @Expose({ name: 'keep_alive' })
    keepAlive: string;

    @Expose()
    @Type(() => Tool)
    tools: Tool[];

    @Expose()
    options: Record<string, any>;

    constructor(
        model: string,
        messages: Message[],
        stream: boolean,
        format: string,
        keepAlive: string,
        tools: Tool[],
        options: Record<string, any>
    ) {
        this.model = model;
        this.messages = messages;
        this.stream = stream;
        this.format = format;
        this.keepAlive = keepAlive;
        this.tools = tools;
        this.options = options;
    }

    /**
     * Builder class for ChatRequest
     */
    static builder(model: string): ChatRequestBuilder {
        return new ChatRequestBuilder(model);
    }
}

/**
 * Builder interface for ChatRequest
 */
export class ChatRequestBuilder {
    private model: string;
    private messages: Message[] = [];
    private stream: boolean = false;
    private format?: string;
    private keepAlive?: string;
    private tools: Tool[] = [];
    private options: Record<string, any> = {};

    constructor(model: string) {
        Assert.notNull(model, 'The model can not be null.');
        this.model = model;
    }

    withMessages(messages: Message[]): ChatRequestBuilder {
        this.messages = messages;
        return this;
    }

    withStream(stream: boolean): ChatRequestBuilder {
        this.stream = stream;
        return this;
    }

    withFormat(format: string): ChatRequestBuilder {
        this.format = format;
        return this;
    }

    withKeepAlive(keepAlive: string): ChatRequestBuilder {
        this.keepAlive = keepAlive;
        return this;
    }

    withTools(tools: Tool[]): ChatRequestBuilder {
        this.tools = tools;
        return this;
    }

    withOptions(options: Record<string, any>): ChatRequestBuilder {
        Assert.notNull(options, 'The options can not be null.');

        this.options = OllamaOptions.filterNonSupportedFields(options);
        return this;
    }

    withOptionsObject(options: OllamaOptions): ChatRequestBuilder {
        Assert.notNull(options, 'The options can not be null.');

        this.options = OllamaOptions.filterNonSupportedFields(instanceToPlain(options));
        return this;
    }

    build(): ChatRequest {
        return new ChatRequest(
            this.model,
            this.messages,
            this.stream,
            this.format!,
            this.keepAlive!,
            this.tools,
            this.options
        );
    }
}
