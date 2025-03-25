import { Message } from '../message';
import { ChatResponse } from '../model';
import { Prompt } from '../prompt';

export const ToolHandler = Symbol('ToolHandler');

export interface ToolHandler {
    handle(prompt: Prompt, chatResponse: ChatResponse): Promise<Message[]>;
}
