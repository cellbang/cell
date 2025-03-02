import { Content } from '../../model/model-protocol';
import { MimeType } from '@celljs/core';

/**
 * The Media class represents the data and metadata of a media attachment in a message. It
 * consists of a MIME type and the raw data.
 *
 * This class is used as a parameter in the constructor of the UserMessage class.
 *
 */
export interface Media {

    /**
     * The unique identifier of the media attachment.
     */
    id?: string;

    /**
     * The MIME type of the media attachment.
     */
    mimeType: MimeType;

    /**
     * The raw data of the media attachment.
     */
    data: any;

    /**
     * The name of the media object that can be referenced by the AI model.
     * <p>
     * Important security note: This field is vulnerable to prompt injections, as the
     * model might inadvertently interpret it as instructions. It is recommended to
     * specify neutral names.
     *
     * <p>
     * The name must only contain:
     * <ul>
     * <li>Alphanumeric characters
     * <li>Whitespace characters (no more than one in a row)
     * <li>Hyphens
     * <li>Parentheses
     * <li>Square brackets
     * </ul>
     */
    name?: string;

}

/**
 * The MessageType enum represents the type of a message in a chat application. It can be
 * one of the following: USER, ASSISTANT, SYSTEM, FUNCTION.
 */
export enum MessageType {
    USER = 'user',
    ASSISTANT = 'assistant',
    SYSTEM = 'system',
    FUNCTION = 'function',
    TOOL = 'tool'
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

/**
 * Represents a tool call.
 */
export interface ToolCall {
    /**
     * The unique identifier for the tool call.
     */
    id: string;

    /**
     * The type of the tool.
     */
    type: string;

    /**
     * The name of the tool.
     */
    name: string;

    /**
     * The arguments passed to the tool.
     */
    arguments: string;
}
