import { Expose } from 'class-transformer';

/**
 * The type of the content block.
 */
export enum ContentBlockType {
    /**
     * Tool request
     */
    TOOL_USE = 'tool_use',

    /**
     * Send tool result back to LLM.
     */
    TOOL_RESULT = 'tool_result',

    /**
     * Text message.
     */
    TEXT = 'text',

    /**
     * Text delta message. Returned from the streaming response.
     */
    TEXT_DELTA = 'text_delta',

    /**
     * Tool use input partial JSON delta streaming.
     */
    INPUT_JSON_DELTA = 'input_json_delta',

    /**
     * Image message.
     */
    IMAGE = 'image',

    /**
     * Document message.
     */
    DOCUMENT = 'document',

}

/**
 * The source of the media content. (Applicable for "image" types only)
 */
export class Source {

    /**
     * The type of the media content. Only "base64" is supported at the moment.
     */
    type: string;

    /**
     * The media type of the content. For example, "image/png" or "image/jpeg".
     */
    @Expose({ name: 'media_type' })
    mediaType: string;

    /**
     * The base64-encoded data of the content.
     */
    data: string;

    constructor(type: string, mediaType: string, data: string) {
        this.type = type;
        this.mediaType = mediaType;
        this.data = data;
    }

    /**
     * Create source
     * @param mediaType The media type of the content.
     * @param data The content data.
     */
    public static from(mediaType: string, data: string): Source {
        return new Source('base64', mediaType, data);
    }

}

/**
 * The content block of the message.
 */
export class ContentBlock {

    /**
     * The content type can be "text", "image", "tool_use", "tool_result" or "text_delta".
     */
    type: ContentBlockType;

    /**
     * The source of the media content. Applicable for "image" types only.
     */
    source?: Source;

    /**
     * The text of the message. Applicable for "text" types only.
     */
    text?: string;

    /**
     * The index of the content block. Applicable only for streaming responses.
     */
    index?: number;

    /**
     * The id of the tool use. Applicable only for tool_use response.
     */
    id?: string;

    /**
     * The name of the tool use. Applicable only for tool_use response.
     */
    name?: string;

    /**
     * The input of the tool use. Applicable only for tool_use response.
     */
    input?: Record<string, any>;

    /**
     * The id of the tool use. Applicable only for tool_result response.
     */
    @Expose({ name: 'tool_use_id' })
    toolUseId?: string;

    /**
     * The content of the tool result. Applicable only for tool_result response.
     */
    content?: string;

    constructor(
        type: ContentBlockType,
        source?: Source,
        text?: string,
        index?: number,
        id?: string,
        name?: string,
        input?: Record<string, any>,
        toolUseId?: string,
        content?: string
    ) {
        this.type = type;
        this.source = source;
        this.text = text;
        this.index = index;
        this.id = id;
        this.name = name;
        this.input = input;
        this.toolUseId = toolUseId;
        this.content = content;
    }

}
