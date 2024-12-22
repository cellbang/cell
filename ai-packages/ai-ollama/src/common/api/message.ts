import { Expose, Type } from 'class-transformer';

/**
 * The role of the message in the conversation.
 */
export enum Role {
    /**
     * System message type used as instructions to the model.
     */
    SYSTEM = 'system',
    /**
     * User message type.
     */
    USER = 'user',
    /**
     * Assistant message type. Usually the response from the model.
     */
    ASSISTANT = 'assistant',
    /**
     * Tool message.
     */
    TOOL = 'tool'
}

/**
 * The function definition.
 *
 * @param name The name of the function.
 * @param arguments The arguments that the model expects you to pass to the function.
 */
export class ToolCallFunction {
    @Expose()
    name: string;

    @Expose()
    arguments: Record<string, any>;

    constructor(name?: string, args?: Record<string, any>) {
        this.name = name!;
        this.arguments = args!;
    }
}

/**
 * The relevant tool call.
 *
 * @param function The function definition.
 */
export class ToolCall {
    @Expose()
    @Type(() => ToolCallFunction)
    function: ToolCallFunction;

    constructor(func: ToolCallFunction) {
        this.function = func;
    }
}

/**
 * Chat message object.
 *
 * @param role The role of the message of type {@link Role}.
 * @param content The content of the message.
 * @param images The list of base64-encoded images to send with the message.
 *               Requires multimodal models such as llava or bakllava.
 */
export class Message {
    @Expose()
    role: Role;

    @Expose()
    content?: string;

    @Expose()
    images?: string[];

    @Expose()
    @Type(() => ToolCall)
    toolCalls?: ToolCall[];

    constructor(role: Role, content?: string, images?: string[], toolCalls?: ToolCall[]) {
        this.role = role;
        this.content = content;
        this.images = images;
        this.toolCalls = toolCalls;
    }

    static builder(role: Role): MessageBuilder {
        return new MessageBuilder(role);
    }
}

export class MessageBuilder {
    private role: Role;
    private content?: string;
    private images?: string[];
    private toolCalls?: ToolCall[];

    constructor(role: Role) {
        this.role = role;
    }

    withContent(content: string): MessageBuilder {
        this.content = content;
        return this;
    }

    withImages(images: string[]): MessageBuilder {
        this.images = images;
        return this;
    }

    withToolCalls(toolCalls: ToolCall[]): MessageBuilder {
        this.toolCalls = toolCalls;
        return this;
    }

    build(): Message {
        return new Message(this.role, this.content, this.images, this.toolCalls);
    }
}
