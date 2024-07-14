import { AbstractMessage } from './abstract-message';
import { Media, MessageType } from './message-protocol';

export class FunctionMessage extends AbstractMessage {

    constructor(
        override readonly content: string,
        override readonly media: Media[] = [],
        override readonly metadata: Record<string, any> = {}) {
        super(MessageType.FUNCTION, content, media, metadata);
    }
}
