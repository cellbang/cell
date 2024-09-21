import { MediaType } from '@celljs/http';
import { Content } from '../../model/model-protocol';

/**
 * The Media class represents the data and metadata of a media attachment in a message. It
 * consists of a MIME type and the raw data.
 *
 * This class is used as a parameter in the constructor of the UserMessage class.
 *
 */
export interface Media {

    readonly mediaType: MediaType;

    /**
     * Get the media data object
     */
    readonly data: any;

}

/**
 * The MessageType enum represents the type of a message in a chat application. It can be
 * one of the following: USER, ASSISTANT, SYSTEM, FUNCTION.
 */
export enum MessageType {
    USER = 'user',
    ASSISTANT = 'assistant',
    SYSTEM = 'system',
    FUNCTION = 'function'
}

/**
 * The Message interface represents a message that can be sent or received in a chat
 * application. Messages can have content, media attachments, properties, and message
 * types.
 *
 * @see Media
 * @see MessageType
 */
export interface Message extends Content {
    readonly messageType: MessageType;
}

export namespace Message {
    export function isMessage(obj: any): obj is Message {
        return obj && obj.messageType !== undefined;
    }
}
