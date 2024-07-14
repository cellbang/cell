import { AbstractMessage } from './abstract-message';
import { Media, MessageType } from './message-protocol';

export class SystemMessage extends AbstractMessage {

    constructor(
        override readonly content: string,
        override readonly media: Media[] = [],
        override readonly metadata: Record<string, any> = {}) {
        super(MessageType.SYSTEM, content, media, metadata);
    }
}
