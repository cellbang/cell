import { Media, Message, MessageType } from './message-protocol';

export abstract class AbstractMessage implements Message {
    static MESSAGE_TYPE = 'messageType';

    constructor(
        readonly messageType: MessageType,
        readonly content: string,
        readonly media: Media[] = [],
        readonly metadata: Record<string, any> = {}) {
        this.metadata[AbstractMessage.MESSAGE_TYPE] = messageType;
    }
}
