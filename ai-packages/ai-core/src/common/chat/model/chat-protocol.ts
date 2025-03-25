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
    metadata: ChatGenerationMetadata;
}

export interface ChatResponse extends ModelResponse<Generation> {
    metadata: ChatResponseMetadata;
}

export namespace Generation {
    export function from(output: AssistantMessage, metadata = ChatGenerationMetadata.from()): Generation {
        return { output, metadata };
    }
}

export namespace ChatResponse {
    export function from(results: Generation[], metadata = ChatResponseMetadata.createEmpty()): ChatResponse {
        return { result: results[0], results, metadata };
    }

    export function isToolCall(chatResponse: ChatResponse, toolCallFinishReasons: Set<string>): boolean {
        if (!chatResponse) {
            return false;
        }

        const generations = chatResponse.results;
        if (!generations || generations.length === 0) {
            return false;
        }

        return generations.some(g => doIsToolCall(g, toolCallFinishReasons));
    }

    function doIsToolCall(generation: Generation, toolCallFinishReasons: Set<string>): boolean {
        const finishReason = generation.metadata.finishReason ?? '';
        return generation.output.toolCalls?.length > 0 && toolCallFinishReasons.has(finishReason.toLowerCase());
    }
}

export interface StreamingChatModel extends StreamingModel<Prompt, ChatResponse> {

}

export interface ChatModel extends Model<Prompt, ChatResponse>, StreamingChatModel {

}
