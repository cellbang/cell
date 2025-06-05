import { Expose, Type } from 'class-transformer';

export enum ChatCompletionFinishReason {
    /**
     * The model hit a natural stop point or a provided stop sequence.
     */
    STOP = 'stop',
    /**
     * The maximum number of tokens specified in the request was reached.
     */
    LENGTH = 'length',
    /**
     * The content was omitted due to a flag from our content filters.
     */
    CONTENT_FILTER = 'content_filter',
    /**
     * The model called a tool.
     */
    TOOL_CALLS = 'tool_calls',
    /**
     * Only for compatibility with Mistral AI API
     */
    TOOL_CALL = 'tool_call'
}

/**
 * The role of the author of this message.
 */
export enum Role {
    /**
     * System message.
     */
    SYSTEM = 'system',
    /**
     * User message.
     */
    USER = 'user',
    /**
     * Assistant message.
     */
    ASSISTANT = 'assistant',
    /**
     * Tool message.
     */
    TOOL = 'tool'
}

/**
 * The function definition.
 */
export class ChatCompletionFunction {
    /**
     * The name of the function.
     */
    @Expose()
    name: string;
    /**
     * The arguments that the model expects you to pass to the function.
     */
    @Expose()
    arguments: string;
}

/**
 * The relevant tool call.
 */
export class ToolCall {
    /**
     * The index of the tool call in the list of tool calls. Required in
     * case of streaming.
     */
    @Expose()
    index?: number;
    /**
     * The ID of the tool call. This ID must be referenced when you submit
     * the tool outputs in using the Submit tool outputs to run endpoint.
     */
    @Expose()
    id: string;
    /**
     * The type of tool call the output is required for. For now, this is
     * always function.
     */
    @Expose()
    type: string;
    /**
     * The function definition.
     */
    @Type(() => ChatCompletionFunction)
    @Expose()
    function: ChatCompletionFunction;
}

/**
 * Audio response from the model.
 */
export class AudioOutput {
    /**
     * Unique identifier for the audio response from the model.
     */
    @Expose()
    id?: string;
    /**
     * Audio output from the model.
     */
    @Expose()
    data?: string;
    /**
     * When the audio content will no longer be available on the server.
     */
    @Expose({ name: 'expires_at' })
    expiresAt?: number;
    /**
     * Transcript of the audio output from the model.
     */
    @Expose()
    transcript?: string;

    static create(id?: string, data?: string, expiresAt?: number, transcript?: string): AudioOutput {
        const audio = new AudioOutput();
        audio.id = id;
        audio.data = data;
        audio.expiresAt = expiresAt;
        audio.transcript = transcript;
        return audio;
    }
}

/**
 * The format of the encoded audio data. Currently supports "wav" and "mp3".
 */
export enum Format {
    /**
     * MP3 audio format.
     */
    MP3 = 'mp3',
    /**
     * WAV audio format.
     */
    WAV = 'wav'
}

/**
 * Audio input data.
 */
export class InputAudio {
    /**
     * Base64 encoded audio data.
     */
    @Expose()
    data: string;
    /**
     * The format of the encoded audio data. Currently supports "wav" and "mp3".
     */
    @Expose()
    format: Format;
}

/**
 * Image content.
 */
export class ImageUrl {
    /**
     * Either a URL of the image or the base64 encoded image data. The
     * base64 encoded image data must have a special prefix in the following
     * format: "data:{mimetype};base64,{base64-encoded-image-data}".
     */
    @Expose()
    url: string;
    /**
     * Specifies the detail level of the image.
     */
    @Expose()
    detail?: string;
}

/**
 * An array of content parts with a defined type. Each MediaContent can be of
 * either "text", "image_url", or "input_audio" type. Only one option allowed.
 */
export class MediaContent {
    /**
     * Content type, each can be of type text or image_url.
     */
    @Expose()
    type: string;
    /**
     * The text content of the message.
     */
    @Expose()
    text: string;
    /**
     * The image content of the message. You can pass multiple images
     * by adding multiple image_url content parts. Image input is only supported when
     * using the gpt-4-visual-preview model.
     */
    @Expose({ name: 'image_url' })
    @Type(() => ImageUrl)
    imageUrl: ImageUrl;
    /**
     * Audio content part.
     */
    @Expose({ name: 'input_audio' })
    @Type(() => InputAudio)
    inputAudio: InputAudio;

    static createText(text: string): MediaContent {
        const content = new MediaContent();
        content.type = 'text';
        content.text = text;
        return content;
    }

    static createImageUrl(url: string, detail?: string): MediaContent {
        const content = new MediaContent();
        content.type = 'image_url';
        content.imageUrl = new ImageUrl();
        content.imageUrl.url = url;
        content.imageUrl.detail = detail;
        return content;
    }

    static createInputAudio(data: string, format: Format): MediaContent {
        const content = new MediaContent();
        content.type = 'input_audio';
        content.inputAudio = new InputAudio();
        content.inputAudio.data = data;
        content.inputAudio.format = format;
        return content;
    }
}

export class ChatCompletionMessage {
    /**
     * The contents of the message. Can be either a {@link MediaContent}
     * or a {@link String}. The response message content is always a {@link String}.
     */
    @Expose({ name: 'content' })
    content: any;
    /**
     * The role of the messages author. Could be one of the {@link Role}
     * types.
     */
    @Expose()
    role: Role;
    /**
     * An optional name for the participant. Provides the model information to
     * differentiate between participants of the same role. In case of Function calling,
     * the name is the function name that the message is responding to.
     */
    @Expose()
    name?: string;
    /**
     * Tool call that this message is responding to. Only applicable for
     * the {@link Role#TOOL} role and null otherwise.
     */
    @Expose({ name: 'tool_call_id' })
    toolCallId?: string;
    /**
     * The tool calls generated by the model, such as function calls.
     * Applicable only for {@link Role#ASSISTANT} role and null otherwise.
     */
    @Expose({ name: 'tool_calls' })
    toolCalls?: ToolCall[];
    /**
     * The refusal message by the assistant. Applicable only for
     * {@link Role#ASSISTANT} role and null otherwise.
     */
    @Expose()
    refusal?: string;
    /**
     * Audio response from the model.
     */
    @Expose({ name: 'audio' })
    @Type(() => AudioOutput)
    audioOutput?: AudioOutput;

    /**
     * 创建一个新的聊天消息实例。
     *
     * @param text - 消息内容。
     * @param role - 消息角色，表示发送者的身份。
     * @returns 返回一个包含指定内容和角色的 ChatCompletionMessage 实例。
     */
    static create(text: any, role: Role): ChatCompletionMessage {
        const message = new ChatCompletionMessage();
        message.content = text;
        message.role = role;
        return message;
    }

}
