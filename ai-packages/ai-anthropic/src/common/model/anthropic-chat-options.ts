import { FunctionCallback, FunctionCallingOptions } from '@celljs/ai-core';
import { Exclude, Expose } from 'class-transformer';
import { Metadata } from '../api/chat-request';
import { Constant } from '@celljs/core';

/**
 * The options to be used when sending a chat request to the Anthropic API.
 */
@Constant(AnthropicChatOptions, new AnthropicChatOptions())
export class AnthropicChatOptions implements FunctionCallingOptions {

    @Expose()
    model: string;

    @Expose({ name: 'max_tokens' })
    maxTokens: number;

    @Expose()
    metadata: Metadata;

    @Expose({ name: 'stop_sequences' })
    stopSequences: string[];

    @Expose({ name: 'temperature' })
    temperature: number;

    @Expose({ name: 'top_p' })
    topP: number;

    @Expose({ name: 'top_k' })
    topK: number;

    /**
     * Tool Function Callbacks to register with the ChatModel. For Prompt
     * Options the functionCallbacks are automatically enabled for the duration of the
     * prompt execution. For Default Options the functionCallbacks are registered but
     * disabled by default. Use the enableFunctions to set the functions from the registry
     * to be used by the ChatModel chat completion requests.
     */
    @Exclude()
    functionCallbacks: FunctionCallback[] = [];

    /**
     * List of functions, identified by their names, to configure for function calling in
     * the chat completion requests. Functions with those names must exist in the
     * functionCallbacks registry. The {@link #functionCallbacks} from the PromptOptions
     * are automatically enabled for the duration of the prompt execution
     *
     * Note that function enabled with the default options are enabled for all chat
     * completion requests. This could impact the token count and the billing. If the
     * functions is set in a prompt options, then the enabled functions are only active
     * for the duration of this prompt execution
     */
    @Exclude()
    functions: Set<string> = new Set<string>();
    @Exclude()
    proxyToolCalls = false;

    @Exclude()
    toolContext: Record<string, any> = {};

    static builder(): AnthropicChatOptionsBuilder {
        return new AnthropicChatOptionsBuilder();
    }

    static fromOptions(fromOptions: AnthropicChatOptions): AnthropicChatOptions {
        return AnthropicChatOptions.builder()
            .model(fromOptions.model)
            .maxTokens(fromOptions.maxTokens)
            .metadata(fromOptions.metadata)
            .stopSequences(fromOptions.stopSequences)
            .temperature(fromOptions.temperature)
            .topP(fromOptions.topP)
            .topK(fromOptions.topK)
            .functionCallbacks(fromOptions.functionCallbacks)
            .functions(fromOptions.functions)
            .proxyToolCalls(fromOptions.proxyToolCalls)
            .toolContext(fromOptions.toolContext)
            .build();
    }
}

export class AnthropicChatOptionsBuilder  {

    private options: AnthropicChatOptions = new AnthropicChatOptions();

    model(model: string): AnthropicChatOptionsBuilder {
        this.options.model = model;
        return this;
    }

    maxTokens(maxTokens: number): AnthropicChatOptionsBuilder {
        this.options.maxTokens = maxTokens;
        return this;
    }

    metadata(metadata: Metadata): AnthropicChatOptionsBuilder {
        this.options.metadata = metadata;
        return this;
    }

    stopSequences(stopSequences: string[]): AnthropicChatOptionsBuilder {
        this.options.stopSequences = stopSequences;
        return this;
    }

    temperature(temperature: number): AnthropicChatOptionsBuilder {
        this.options.temperature = temperature;
        return this;
    }

    topP(topP: number): AnthropicChatOptionsBuilder {
        this.options.topP = topP;
        return this;
    }

    topK(topK: number): AnthropicChatOptionsBuilder {
        this.options.topK = topK;
        return this;
    }

    functionCallbacks(functionCallbacks: FunctionCallback[]): AnthropicChatOptionsBuilder {
        this.options.functionCallbacks = functionCallbacks;
        return this;
    }

    functions(functions: Set<string>): AnthropicChatOptionsBuilder {
        this.options.functions = functions;
        return this;
    }

    function(functionName: string): AnthropicChatOptionsBuilder {
        this.options.functions.add(functionName);
        return this;
    }

    proxyToolCalls(proxyToolCalls: boolean): AnthropicChatOptionsBuilder {
        this.options.proxyToolCalls = proxyToolCalls;
        return this;
    }

    toolContext(toolContext: Record<string, any>): AnthropicChatOptionsBuilder {
        if (this.options.toolContext === undefined) {
            this.options.toolContext = toolContext;
        } else {
            this.options.toolContext = { ...this.options.toolContext, ...toolContext };
        }
        return this;
    }

    build(): AnthropicChatOptions {
        return this.options;
    }
}
