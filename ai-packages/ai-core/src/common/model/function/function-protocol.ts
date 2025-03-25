import { ChatOptions } from '../../chat/prompt';

export const FunctionCallbackRegister = Symbol('FunctionCallbackRegister');

export interface ToolContext extends Record<string, any> {}

export namespace ToolContext {
    export const TOOL_CALL_HISTORY = 'TOOL_CALL_HISTORY';
}

/**
 * Represents a model function call handler. Implementations are registered with the
 * Models and called on prompts that trigger the function call.
 */
export interface FunctionCallback {

    /**
     * The Function name. Unique within the model.
     */
    readonly name: string;

    /**
     * The function description. This description is used by the model do
     * decide if the function should be called or not.
     */
    readonly description: string;

    /**
     * The JSON schema of the function input type.
     */
    readonly inputTypeSchema: string;

    /**
     * Called when a model detects and triggers a function call. The model is responsible
     * to pass the function arguments in the pre-configured JSON schema format.
     * @param functionArguments JSON string with the function arguments to be passed to the
     * function. The arguments are defined as JSON schema usually registered with the the
     * model.
     * @param toolContext Optional tool context to be passed to the function call.
     * @return String containing the function call response.
     */
    call(functionArguments: string, toolContext?: ToolContext): Promise<string>;

}

export interface FunctionCallingOptions {

    /**
     * Function Callbacks to be registered with the ChatClient. For Prompt Options the
     * functionCallbacks are automatically enabled for the duration of the prompt
     * execution. For Default Options the FunctionCallbacks are registered but disabled by
     * default. You have to use "functions" property to list the function names from the
     * ChatClient registry to be used in the chat completion requests.
     */
    functionCallbacks: FunctionCallback[];

    /**
     * List of function names from the ChatClient registry to be used in the next
     * chat completion requests.
     */
    functions: Set<string>;

    proxyToolCalls?: boolean;

    toolContext?: ToolContext;
}

export namespace FunctionCallingOptions {
    export function is(obj: any): obj is FunctionCallingOptions {
        return obj && obj.functionCallbacks !== undefined && obj.functions !== undefined;
    }

    export function getEnabledFunctionsToCall(runtimeFunctionOptions: FunctionCallingOptions): Set<string> {
        const enabledFunctionsToCall = new Set<string>();
        if (runtimeFunctionOptions) {
            // Add the explicitly enabled functions.
            if (runtimeFunctionOptions.functions) {
                runtimeFunctionOptions.functions.forEach((fn) => {
                    enabledFunctionsToCall.add(fn);
                });
            }

            if (runtimeFunctionOptions.functionCallbacks) {
                runtimeFunctionOptions.functionCallbacks.forEach((functionCallback) => {
                    // Automatically enable the function, usually from prompt callback.
                    enabledFunctionsToCall.add(functionCallback.name);
                });
            }
        }
        return enabledFunctionsToCall;
    }

    /**
     * Check if the proxyToolCalls is enabled for the given prompt or the default tool
     * call options. The prompt options take precedence over the default options. When the
     * proxyToolCalls is enabled the ChatModel implementation will pass the proxyToolCalls to the
     * function call.
     * @param chatOptions the chat options to check.
     * @param defaultOptions the default tool call options to check.
     * @return true if the proxyToolCalls is enabled, false otherwise.
     */
    export function isProxyToolCalls(chatOptions: ChatOptions, defaultOptions: FunctionCallingOptions): boolean {
        if (FunctionCallingOptions.is(chatOptions) && chatOptions.proxyToolCalls !== undefined) {
            return chatOptions.proxyToolCalls;
        }
        return defaultOptions.proxyToolCalls ?? false;
    }

}

export interface FunctionCallbackRegister {
    resolve(functionNames: string[]): FunctionCallback[];
    register(functionCallback: FunctionCallback): void;
    unregister(functionName: string): void;
    call(functionName: string, functionArguments: string, toolContext: ToolContext): Promise<string>;
}

export interface PortableFunctionCallingOptions extends FunctionCallingOptions, ChatOptions {

}

