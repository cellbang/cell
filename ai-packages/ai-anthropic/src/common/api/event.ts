import { Expose, Type } from 'class-transformer';
import { ChatResponse } from './chat-response';
import { StreamEvent } from '@celljs/ai-core';
import { ContentBlockType } from './content-block';

/**
 * The event type of the streamed chunk.
 */
export enum EventType {
    /**
     * Message start event. Contains a Message object with empty content.
     */
    MESSAGE_START = 'message_start',

    /**
     * Message delta event, indicating top-level changes to the final Message object.
     */
    MESSAGE_DELTA = 'message_delta',

    /**
     * A final message stop event.
     */
    MESSAGE_STOP = 'message_stop',

    /**
     * Content block start event.
     */
    CONTENT_BLOCK_START = 'content_block_start',

    /**
     * Content block delta event.
     */
    CONTENT_BLOCK_DELTA = 'content_block_delta',

    /**
     * A final content block stop event.
     */
    CONTENT_BLOCK_STOP = 'content_block_stop',

    /**
     * Error event.
     */
    ERROR = 'error',

    /**
     * Ping event.
     */
    PING = 'ping',

    /**
     * Artificially created event to aggregate tool use events.
     */
    TOOL_USE_AGGREGATE = 'tool_use_aggregate'

}

/**
 * Anthropic event.
 */
export class AnthropicEvent {
    @Expose()
    type: EventType;
}

/**
 * Content block body.
 */
export class ContentBlockBody {
    /**
     * The type of the content block. e.g. "text", "tool_use".
     */
    @Expose()
    type: string;
}

/**
 * Text content block delta.
 */
export class ContentBlockText extends ContentBlockBody {

    /*
     * The text of the message. Applicable for "text" types only.
     */
    @Expose()
    text: string;
}

/**
 * Tool use content block.
 */
export class ContentBlockToolUse extends ContentBlockBody {
    /*
     * The id of the tool use. Applicable only for tool_use response.
     */
    @Expose()
    id: string;

    /*
     * The name of the tool use. Applicable only for tool_use response.
     */
    @Expose()
    name: string;

    /*
     * The input of the tool use. Applicable only for tool_use response.
     */
    @Expose()
    input: Record<string, any>;

    constructor(type: ContentBlockType, id: string, name: string, input: Record<string, any>) {
        super();
        this.type = type;
        this.id = id;
        this.name = name;
        this.input = input;
    }
}

export class AnthropicEventWithContentBlock extends AnthropicEvent {
    /**
     * The content block body.
     */
    @Type(() => ContentBlockBody, {
        discriminator: {
            property: 'type',
            subTypes: [
                { value: ContentBlockText, name: ContentBlockType.TEXT },
                { value: ContentBlockToolUse, name: ContentBlockType.TOOL_USE }
            ]
        }
    })
    @Expose()
    contentBlock: ContentBlockBody;
}

/**
 * Special event used to aggregate multiple tool use events into a single event with
 * list of aggregated ContentBlockToolUse.
 */
export class ToolUseAggregationEvent extends AnthropicEvent {
    /*
     * The index of the content block. Applicable only for streaming responses.
     */
    @Expose()
    index?: number;

    /*
     * The id of the tool use. Applicable only for tool_use response.
     */
    @Expose()
    id?: string;

    /*
     * The name of the tool use. Applicable only for tool_use response.
     */
    @Expose()
    name?: string;

    /*
     * The partial JSON content.
     */
    @Expose()
    partialJson = '';

    /*
     * The tool content blocks.
     */
    @Type(() => ContentBlockToolUse)
    @Expose()
    toolContentBlocks: ContentBlockToolUse[] = [];

    isEmpty(): boolean {
        return (this.index === undefined || !this.id || !this.name || !this.partialJson);
    }

    appendPartialJson(partialJson: string): ToolUseAggregationEvent {
        this.partialJson = this.partialJson + partialJson;
        return this;
    }

    squashIntoContentBlock(): void {
        const map = (this.partialJson) ? JSON.parse(this.partialJson) : {};
        this.toolContentBlocks.push(new ContentBlockToolUse(ContentBlockType.TOOL_USE, this.id!, this.name!, map));
        this.index = undefined;
        this.id = undefined;
        this.name = undefined;
        this.partialJson = '';
    }
}

/**
 * Content block delta body.
 */
export class ContentBlockDeltaBody {
    /*
     * The type of the content block. e.g. "text", "input_json".
     */
    @Expose()
    type: string;
}

/**
 * Text content block delta.
 */
export class ContentBlockDeltaText extends ContentBlockDeltaBody {
    /*
     * The text of the message. Applicable for "text" types only.
     */
    @Expose()
    text: string;
}

/**
 * JSON content block delta.
 */
export class ContentBlockDeltaJson extends ContentBlockDeltaBody {
    /*
     * The partial JSON content.
     */
    @Expose()
    partialJson: string;
}

/**
 * Content block stop event.
 */
export class ContentBlockStopEvent extends AnthropicEvent {
    /*
     * The index of the content block. Applicable only for streaming responses.
     */
    @Expose()
    index: number;
}

/**
 * Content block start event.
 */
export class ContentBlockStartEvent extends AnthropicEventWithContentBlock {

    /*
     * The index of the content block. Applicable only for streaming responses.
     */
    @Expose()
    index: number;
}

/**
 * Content block delta event.
 */
export class ContentBlockDeltaEvent extends AnthropicEvent {

    /*
     * The index of the content block. Applicable only for streaming responses.
     */
    @Expose()
    index: number;

    /*
     * The content block delta body.
     */
    @Type(() => ContentBlockDeltaBody, {
        discriminator: {
            property: 'type',
            subTypes: [
                { value: ContentBlockDeltaText, name: ContentBlockType.TEXT_DELTA },
                { value: ContentBlockDeltaJson, name: ContentBlockType.INPUT_JSON_DELTA }
            ]
        }
    })
    @Expose()
    delta: ContentBlockDeltaBody;

}

/**
 * Message start event.
 */
export class MessageStartEvent  {
    /*
     * The event type.
     */
    @Expose()
    type: EventType;

    /*
     * The message body.
     */
    @Type(() => ChatResponse)
    @Expose()
    message: ChatResponse;

    constructor(type: EventType, message: ChatResponse) {
        this.type = type;
        this.message = message;
    }
}

/**
 * Message delta.
 */
export class MessageDelta {
    /*
     * The stop reason.
     */
    @Expose({ name: 'stop_reason' })
    stopReason: string;

    /*
     * The stop sequence.
     */
    @Expose({ name: 'stop_sequence' })
    stopSequence: string;
}

/**
 * Message delta usage.
 */
export class MessageDeltaUsage {
    /*
     * The output tokens.
     */
    @Expose({ name: 'output_tokens' })
    outputTokens: number;
}

/**
 * Message delta event.
 */
export class MessageDeltaEvent extends AnthropicEvent {

    /*
     * The message delta body.
     */
    @Type(() => MessageDelta)
    @Expose()
    delta: MessageDelta;

    /*
     * The message delta usage.
     */
    @Type(() => MessageDeltaUsage)
    @Expose()
    usage: MessageDeltaUsage;

}

/**
 * Message stop event.
 */
export class MessageStopEvent extends AnthropicEvent {

}

/**
 * Error event.
 */
export class ErrorEvent extends AnthropicEvent {

    /*
     * The error body.
     */
    error: Error;
}

/**
 * Error body.
 */
export class Error {
    /*
     * The error type.
     */
    @Expose()
    type: string;

    /*
     * The error message.
     */
    @Expose()
    message: string;
}

/**
 * Ping event.
 */
export class PingEvent extends AnthropicEvent {

}

export class AnthropicStreamEvent implements StreamEvent<AnthropicEvent> {
    event?: EventType;
    @Type(() => AnthropicEvent, {
        discriminator: {
            property: 'type',
            subTypes: [
                { value: ContentBlockStartEvent, name: EventType.CONTENT_BLOCK_START },
                { value: ContentBlockDeltaEvent, name: EventType.CONTENT_BLOCK_DELTA },
                { value: ContentBlockStopEvent, name: EventType.CONTENT_BLOCK_STOP },
                { value: PingEvent, name: EventType.PING },
                { value: ErrorEvent, name: EventType.ERROR },
                { value: MessageStartEvent, name: EventType.MESSAGE_START },
                { value: MessageDeltaEvent, name: EventType.MESSAGE_DELTA },
                { value: MessageStopEvent, name: EventType.MESSAGE_STOP }
            ]
        }
    })
    data: AnthropicEvent;
    raw: string[];
}
