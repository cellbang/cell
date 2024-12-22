import { AbstractMessage } from './abstract-message';
import { MessageType } from './message-protocol';

/**
 * Represents a tool response.
 */
export interface ToolResponse {
    /**
     * The unique identifier for the tool.
     */
    id: string;

    /**
     * The name of the tool.
     */
    name: string;

    /**
     * The response data from the tool.
     */
    responseData: string;
}

/**
 * The ToolResponseMessage class represents a message with a function content in a chat
 * application.
 */
export class ToolResponseMessage extends AbstractMessage {

    /**
     * Creates an instance of ToolResponseMessage.
     * @param responses The list of tool responses.
     * @param metadata Additional metadata.
     */
    constructor(
        readonly responses: ToolResponse[], metadata: Record<string, any> = {}) {
        super(MessageType.TOOL, '', [], metadata);
        this.responses = responses;
    }
}
