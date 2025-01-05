import { Model, ModelResponse, ModelResult, StreamingModel } from '../../model/model-protocol';
import { AssistantMessage } from '../message';
import { ChatGenerationMetadata, ChatResponseMetadata } from '../metadata';
import { Prompt } from '../prompt/prompt-protocol';

export const StreamingChatModel = Symbol('StreamingChatModel');
export const ChatModel = Symbol('ChatModel');

/**
 * Represents a response returned by the AI.
 */
export interface Generation extends ModelResult<AssistantMessage> {

}

export interface ChatResponse extends ModelResponse<Generation> {

}

export namespace Generation {
    export function from(output: AssistantMessage, metadata = ChatGenerationMetadata.EMPTY): Generation {
        return { output, metadata };
    }
}

export namespace ChatResponse {
    export function from(results: Generation[], metadata = ChatResponseMetadata.EMPTY): ChatResponse {
        return { result: results[0], results, metadata };
    }
}

export interface StreamingChatModel extends StreamingModel<Prompt, ChatResponse> {

}

export interface ChatModel extends Model<Prompt, ChatResponse>, StreamingChatModel {

}
