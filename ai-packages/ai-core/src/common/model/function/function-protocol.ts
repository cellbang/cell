import { ChatOptions } from '../../chat/prompt';

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
     * @return String containing the function call response.
     */
    call(functionArguments: string): Promise<string>;

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
    functions: Set<String>;
}

export namespace FunctionCallingOptions {
    export function is(obj: any): obj is FunctionCallingOptions {
        return obj && obj.functionCallbacks !== undefined && obj.functions !== undefined;
    }
}

export interface PortableFunctionCallingOptions extends FunctionCallingOptions, ChatOptions {

}

