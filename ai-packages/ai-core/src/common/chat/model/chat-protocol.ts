import { Model, ModelResponse, ModelResult, StreamingModel } from '../../model/model-protocol';
import { AssistantMessage } from '../message';
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

export interface StreamingChatModel extends StreamingModel<Prompt, ChatResponse> {

}

export interface ChatModel extends Model<Prompt, ChatResponse>, StreamingChatModel {

}
