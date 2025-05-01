import { Type, Expose, instanceToPlain, Exclude } from 'class-transformer';
import { Message } from './message';
import { OllamaOptions } from './ollama-options';
import { Assert } from '@celljs/core';

/**
 * Function definition.
 */
export class FunctionDefinition {
    /**
     * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes.
     */
    name: string;

    /**
     * A description of what the function does, used by the model to choose when and how to call the function.
     */
    description: string;

    /**
     * The parameters the functions accepts, described as a JSON Schema object. To describe a function that
     * accepts no parameters, provide the value {"type": "object", "properties": {}}.
     */
    parameters: Record<string, any>;

    constructor(description: string, name: string, jsonSchema: string) {
        this.description = description;
        this.name = name;
        this.parameters = JSON.parse(jsonSchema);
    }
}

/**
 * Represents a tool the model may call. Currently, only functions are supported as a tool.
 */
export class Tool {
    /**
     * The type of the tool. Currently, only 'function' is supported.
     */
    type: ToolType;

    /**
     * The function definition.
     */
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
 * @see [Chat Completion API](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion)
 * @see [Ollama Types](https://github.com/ollama/ollama/blob/main/api/types.go)
 */
export class ChatRequest {
    /**
     * The model to use for completion. It should be a name familiar to Ollama from the [Library](https://ollama.com/library).
     */
    model: string;

    /**
     * The list of messages in the chat. This can be used to keep a chat memory.
     */
    @Type(() => Message)
    messages: Message[];

    /**
     * Whether to stream the response. If false, the response will be returned as a single response object rather than a stream of objects.
     */
    stream: boolean;

    /**
     * The format to return the response in. Currently, the only accepted value is "json".
     */
    format: string;

    /**
     * Controls how long the model will stay loaded into memory following this request (default: 5m).
     */
    @Expose({ name: 'keep_alive' })
    keepAlive: string;

    /**
     * List of tools the model has access to.
     */
    @Type(() => Tool)
    tools: Tool[];

    /**
     * Model-specific options. For example, "temperature" can be set through this field, if the model supports it.
     * You can use the `OllamaOptions` builder to create the options then `OllamaOptions.toMap()` to convert the options into a map.
     */
    options: Record<string, any>;

    /**
     * Optional abort signal to cancel the request.
     */
    @Exclude()
    signal?: AbortSignal;

    constructor(
        model: string,
        messages: Message[],
        stream: boolean,
        format: string,
        keepAlive: string,
        tools: Tool[],
        options: Record<string, any>,
        signal?: AbortSignal
    ) {
        this.model = model;
        this.messages = messages;
        this.stream = stream;
        this.format = format;
        this.keepAlive = keepAlive;
        this.tools = tools;
        this.options = options;
        this.signal = signal;
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
    private stream = false;
    private format?: string;
    private keepAlive?: string;
    private tools: Tool[] = [];
    private options: Record<string, any> = {};
    private signal?: AbortSignal;

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

    withSignal(signal: AbortSignal): ChatRequestBuilder {
        this.signal = signal;
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
            this.options,
            this.signal
        );
    }
}
