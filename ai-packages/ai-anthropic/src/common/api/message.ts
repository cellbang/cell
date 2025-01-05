import { Type } from 'class-transformer';
import { ContentBlock } from './content-block';

/**
 * The role of the message in the conversation.
 */
export enum Role {
    /**
     * User message type.
     */
    USER = 'user',
    /**
     * Assistant message type. Usually the response from the model.
     */
    ASSISTANT = 'assistant',
}

/**
 * Input messages.
 *
 * Our models are trained to operate on alternating user and assistant conversational
 * turns. When creating a new Message, you specify the prior conversational turns with
 * the messages parameter, and the model then generates the next Message in the
 * conversation. Each input message must be an object with a role and content. You can
 * specify a single user-role message, or you can include multiple user and assistant
 * messages. The first message must always use the user role. If the final message
 * uses the assistant role, the response content will continue immediately from the
 * content in that message. This can be used to constrain part of the model's
 * response.
 */
export class AnthropicMessage {
    /**
     * The contents of the message. Can be of one of String or MultiModalContent
     * types.
     */
    @Type(() => ContentBlock)
    content: ContentBlock[];

    /**
     * The role of the messages author. Could be one of the {@link Role}
     * types.
     */
    role: Role;

    constructor(content: ContentBlock[], role: Role) {
        this.content = content;
        this.role = role;
    }
}
