import { AbstractMessage } from './abstract-message';
import { Media, MessageType, ToolCall } from './message-protocol';

export class AssistantMessage extends AbstractMessage {

    constructor(
        override readonly content: string = '',
        override readonly media: Media[] = [],
        override readonly metadata: Record<string, any> = {},
        readonly toolCalls: ToolCall[] = []
    ) {
        super(MessageType.ASSISTANT, content, media, metadata);
    }
}
