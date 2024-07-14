import { AbstractMessage } from './abstract-message';
import { Media, MessageType } from './message-protocol';

export class UserMessage extends AbstractMessage {

    constructor(
        override readonly content: string,
        override readonly media: Media[] = [],
        override readonly metadata: Record<string, any> = {}) {
        super(MessageType.USER, content, media, metadata);
    }
}
