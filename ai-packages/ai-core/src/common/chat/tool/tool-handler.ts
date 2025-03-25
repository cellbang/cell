import { Autowired, Component, IllegalStateError } from '@celljs/core';
import { FunctionCallbackRegister, FunctionCallingOptions, ToolContext } from '../../model';
import { ChatResponse } from '../model';
import { Prompt } from '../prompt';
import { ToolHandler } from './tool-protocol';
import { AssistantMessage, Message, ToolResponse, ToolResponseMessage } from '../message';

@Component(ToolHandler)
export class ToolHanderImpl implements ToolHandler {

    @Autowired(FunctionCallbackRegister)
    protected readonly functionCallbackRegister: FunctionCallbackRegister;

    protected async executeFunctions(assistantMessage: AssistantMessage, toolContext: ToolContext): Promise<ToolResponseMessage> {
        const toolResponses: ToolResponse[] = [];
        for (const toolCall of assistantMessage.toolCalls) {
            const functionResponse = await this.functionCallbackRegister.call(toolCall.name, toolCall.arguments, toolContext);
            toolResponses.push({
                id: toolCall.id,
                name: toolCall.name,
                responseData: functionResponse
            });
        }
        return new ToolResponseMessage(toolResponses);
    }

    protected buildToolCallConversation(previousMessages: Message[], assistantMessage: AssistantMessage, toolResponseMessage: ToolResponseMessage): Message[] {
        const messages = [...previousMessages];
        messages.push(assistantMessage);
        messages.push(toolResponseMessage);
        return messages;
    }

    async handle(prompt: Prompt, chatResponse: ChatResponse): Promise<Message[]> {
        const toolCallGeneration = chatResponse.results.find(result => result.output.toolCalls?.length > 0);
        if (!toolCallGeneration) {
            throw new IllegalStateError('No tool call generation found in the response!');
        }
        const assistantMessage = toolCallGeneration.output;
        let toolContext: ToolContext = {};
        const options = prompt.options;
        if (FunctionCallingOptions.is(options) && options.toolContext) {
            toolContext = { ...options.toolContext };
            const toolCallHistory = prompt.copy().instructions;
            toolContext[ToolContext.TOOL_CALL_HISTORY] = toolCallHistory;
        }
        const toolResponseMessage = await this.executeFunctions(assistantMessage, toolContext);
        const toolConversationHistory = this.buildToolCallConversation(prompt.instructions, assistantMessage, toolResponseMessage);
        return toolConversationHistory;
    }
}
