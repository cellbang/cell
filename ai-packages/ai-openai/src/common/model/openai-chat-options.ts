import { FunctionCallback, FunctionCallingOptions, Prediction } from '@celljs/ai-core';
import { Expose, Exclude, Type } from 'class-transformer';
import { OpenAIModel } from '../api/openai-model';
import { Constant } from '@celljs/core';
import { AudioParameters, FunctionTool, ResponseFormat, StreamOptions } from '../api';

/**
 * Options for the OpenAI Chat API.
 */
@Constant(OpenAIChatOptions, new OpenAIChatOptions())
export class OpenAIChatOptions implements FunctionCallingOptions {
    static readonly DEFAULT_MODEL = OpenAIModel.GPT_3_5_TURBO;

    /**
     * ID of the model to use.
     */
    model?: string;

    /**
     * What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output
     * more random, while lower values like 0.2 will make it more focused and deterministic. We generally recommend
     * altering this or top_p but not both.
     */
    temperature?: number;

    /**
     * The maximum number of tokens to generate in the chat completion. The total length of input
     * tokens and generated tokens is limited by the model's context length.
     */
    @Expose({ name: 'max_tokens' })
    maxTokens?: number;

    /**
     * An alternative to sampling with temperature, called nucleus sampling, where the model considers the
     * results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10%
     * probability mass are considered. We generally recommend altering this or temperature but not both.
     */
    @Expose({ name: 'top_p' })
    topP?: number;

    /**
     * Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they
     * appear in the text so far, increasing the model's likelihood to talk about new topics.
     */
    @Expose({ name: 'presence_penalty' })
    presencePenalty?: number;

    /**
     * Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing
     * frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
     */
    @Expose({ name: 'frequency_penalty' })
    frequencyPenalty?: number;

    /**
     * How many chat completion choices to generate for each input message. Note that you will be charged based
     * on the number of generated tokens across all of the choices. Keep n as 1 to minimize costs.
     */
    n?: number;

    /**
     * Output types that you would like the model to generate for this request.
     * Most models are capable of generating text, which is the default.
     */
    @Expose({ name: 'modalities' })
    outputModalities?: string[];

    /**
     * Audio parameters for the audio generation. Required when audio output is requested with
     * modalities: ["audio"]
     */
    @Expose({ name: 'audio' })
    outputAudio?: AudioParameters;

    /**
     * Modify the likelihood of specified tokens appearing in the completion. Accepts a JSON object
     * that maps tokens (specified by their token ID in the tokenizer) to an associated bias value from -100 to 100.
     */
    @Expose({ name: 'logit_bias' })
    logitBias?: Record<string, number>;

    /**
     * Whether to return log probabilities of the output tokens or not. If true, returns the log probabilities
     * of each output token returned in the 'content' of 'message'.
     */
    @Expose()
    logprobs?: boolean;

    /**
     * An integer between 0 and 5 specifying the number of most likely tokens to return at each token position,
     * each with an associated log probability. 'logprobs' must be set to 'true' if this parameter is used.
     */
    @Expose({ name: 'top_logprobs' })
    topLogprobs?: number;

    /**
     * An object specifying the format that the model must output. Setting to { "type":
     * "json_object" } enables JSON mode, which guarantees the message the model generates is valid JSON.
     */
    @Type(() => ResponseFormat)
    @Expose({ name: 'response_format' })
    responseFormat?: ResponseFormat;

    /**
     * Options for streaming response. Included in the API only if streaming-mode completion is requested.
     */
    @Type(() => StreamOptions)
    @Expose({ name: 'stream_options' })
    streamOptions?: StreamOptions;

    /**
     * This feature is in Beta. If specified, our system will make a best effort to sample
     * deterministically, such that repeated requests with the same seed and parameters should return the same result.
     */
    @Expose()
    seed?: number;

    /**
     * Up to 4 sequences where the API will stop generating further tokens.
     */
    @Expose()
    stop?: string[];

    /**
     * A list of tools the model may call. Currently, only functions are supported as a tool. Use this to
     * provide a list of functions the model may generate JSON inputs for.
     */
    @Type(() => FunctionTool)
    @Expose()
    tools?: FunctionTool[];

    /**
     * Controls which (if any) function is called by the model.
     */
    @Expose({ name: 'tool_choice' })
    toolChoice?: any;

    /**
     * A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.
     */
    @Expose()
    user?: string;

    /**
     * Whether to enable parallel function calling during tool use.
     */
    @Expose({ name: 'parallel_tool_calls' })
    parallelToolCalls?: boolean;

    /**
     * Static predicted output content, such as the content of a text file that is
     * being regenerated.
     */
    @Expose()
    prediction?: Prediction | null;

    /**
     * Tool Function Callbacks to register with the ChatModel.
     */
    @Exclude()
    functionCallbacks: FunctionCallback[] = [];

    /**
     * List of functions, identified by their names, to configure for function calling in
     * the chat completion requests.
     */
    @Exclude()
    functions: Set<string> = new Set<string>();

    /**
     * If true, the AI will not handle the function calls internally, but will proxy them to the client.
     */
    @Exclude()
    proxyToolCalls?: boolean;

    /**
     * Optional HTTP headers to be added to the chat completion request.
     */
    @Exclude()
    httpHeaders: Record<string, string> = {};

    /**
     * Tool context data.
     */
    @Exclude()
    toolContext?: Record<string, any>;

    copy(): OpenAIChatOptions {
        return OpenAIChatOptions.options(this);
    }

    static options(fromOptions: OpenAIChatOptions): OpenAIChatOptions {
        const options = new OpenAIChatOptions();
        Object.assign(options, fromOptions);
        options.functionCallbacks = [...(fromOptions.functionCallbacks || [])];
        options.functions = new Set(fromOptions.functions);
        options.httpHeaders = { ...fromOptions.httpHeaders };
        return options;
    }

    static builder(): OpenAIOptionsBuilder {
        return new OpenAIOptionsBuilder();
    }
}

export class OpenAIOptionsBuilder {
    private options = new OpenAIChatOptions();

    withModel(model: string): OpenAIOptionsBuilder {
        this.options.model = model;
        return this;
    }

    withTemperature(temperature: number): OpenAIOptionsBuilder {
        this.options.temperature = temperature;
        return this;
    }

    withMaxTokens(maxTokens: number): OpenAIOptionsBuilder {
        this.options.maxTokens = maxTokens;
        return this;
    }

    withTopP(topP: number): OpenAIOptionsBuilder {
        this.options.topP = topP;
        return this;
    }

    withPresencePenalty(presencePenalty: number): OpenAIOptionsBuilder {
        this.options.presencePenalty = presencePenalty;
        return this;
    }

    withFrequencyPenalty(frequencyPenalty: number): OpenAIOptionsBuilder {
        this.options.frequencyPenalty = frequencyPenalty;
        return this;
    }

    withN(n: number): OpenAIOptionsBuilder {
        this.options.n = n;
        return this;
    }

    withOutputModalities(modalities: string[]): OpenAIOptionsBuilder {
        this.options.outputModalities = modalities;
        return this;
    }

    withOutputAudio(audio: AudioParameters): OpenAIOptionsBuilder {
        this.options.outputAudio = audio;
        return this;
    }

    withLogitBias(bias: Record<string, number>): OpenAIOptionsBuilder {
        this.options.logitBias = bias;
        return this;
    }

    withLogprobs(logprobs: boolean): OpenAIOptionsBuilder {
        this.options.logprobs = logprobs;
        return this;
    }

    withTopLogprobs(topLogprobs: number): OpenAIOptionsBuilder {
        this.options.topLogprobs = topLogprobs;
        return this;
    }

    withResponseFormat(format: ResponseFormat): OpenAIOptionsBuilder {
        this.options.responseFormat = format;
        return this;
    }

    withStreamOptions(options: StreamOptions): OpenAIOptionsBuilder {
        this.options.streamOptions = options;
        return this;
    }

    withSeed(seed: number): OpenAIOptionsBuilder {
        this.options.seed = seed;
        return this;
    }

    withStop(stop: string[]): OpenAIOptionsBuilder {
        this.options.stop = stop;
        return this;
    }

    withTools(tools: FunctionTool[]): OpenAIOptionsBuilder {
        this.options.tools = tools;
        return this;
    }

    withToolChoice(choice: any): OpenAIOptionsBuilder {
        this.options.toolChoice = choice;
        return this;
    }

    withUser(user: string): OpenAIOptionsBuilder {
        this.options.user = user;
        return this;
    }

    withParallelToolCalls(parallel: boolean): OpenAIOptionsBuilder {
        this.options.parallelToolCalls = parallel;
        return this;
    }

    withFunctionCallbacks(callbacks: FunctionCallback[]): OpenAIOptionsBuilder {
        this.options.functionCallbacks = callbacks;
        return this;
    }

    withFunctions(functions: Set<string>): OpenAIOptionsBuilder {
        this.options.functions = functions;
        return this;
    }

    withProxyToolCalls(proxy: boolean): OpenAIOptionsBuilder {
        this.options.proxyToolCalls = proxy;
        return this;
    }

    withHttpHeaders(headers: Record<string, string>): OpenAIOptionsBuilder {
        this.options.httpHeaders = headers;
        return this;
    }

    withToolContext(context: Record<string, any>): OpenAIOptionsBuilder {
        if (!this.options.toolContext) {
            this.options.toolContext = context;
        } else {
            Object.assign(this.options.toolContext, context);
        }
        return this;
    }

    withPrediction(prediction: Prediction | null): OpenAIOptionsBuilder {
        this.options.prediction = prediction;
        return this;
    }

    build(): OpenAIChatOptions {
        return OpenAIChatOptions.options(this.options);
    }
}
