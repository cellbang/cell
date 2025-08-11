import { Exclude, Expose, Type } from 'class-transformer';
import { ChatCompletionMessage } from './message';
import { ResponseFormat } from './response-format';
import { Prediction } from '@celljs/ai-core';

export class StreamOptions {
    static INCLUDE_USAGE = new StreamOptions(true);

    /**
     * includeUsage If set, an additional chunk will be streamed
     * before the data: [DONE] message. The usage field on this chunk
     * shows the token usage statistics for the entire request, and
     * the choices field will always be an empty array. All other chunks
     * will also include a usage field, but with a null value.
     */
    @Expose({ name: 'include_usage' })
    includeUsage: boolean;

    constructor(includeUsage: boolean) {
        this.includeUsage = includeUsage;
    }
}

/**
 * Function definition.
 */
export class Function {
    @Expose()
    description: string;
    @Expose()
    name: string;
    @Expose()
    parameters: Record<string, any>;
    @Expose()
    strict?: boolean;

    static create(description: string, name: string, parameters: Record<string, any>, strict?: boolean): Function {
        const func = new Function();
        func.description = description;
        func.name = name;
        func.parameters = parameters;
        func.strict = strict;
        return func;
    }
}

export enum ToolType {
    /**
     * Function tool type.
     */
    FUNCTION = 'function'
}

export class FunctionTool {
    /**
     * The type of the tool. Currently, only 'function' is supported.
     */
    @Expose()
    type: ToolType;

    /**
     * The function definition.
     */
    @Type(() => Function)
    @Expose()
    function: Function;

    static create(func: Function): FunctionTool {
        const tool = new FunctionTool();
        tool.type = ToolType.FUNCTION;
        tool.function = func;
        return tool;
    }
}

/**
 * The type of modality for the model completion.
 */
export enum OutputModality {
    AUDIO = 'audio',
    TEXT = 'text',
}

export enum Voice {
    ALLOY = 'alloy',
    ECHO = 'echo',
    FABLE = 'fable',
    ONYX = 'onyx',
    NOVA = 'nova',
    SHIMMER = 'shimmer'
}

export enum AudioResponseFormat {
    MP3 = 'mp3',
    FLAC = 'flac',
    OPUS = 'opus',
    PCM16 = 'pcm16',
    WAV = 'wav'
}

export class AudioParameters {
    /**
     * Specifies the voice type.
     */
    @Expose()
    voice?: Voice;
    /**
     * Specifies the output audio format.
     */
    @Expose({ name: 'response_format' })
    format?: AudioResponseFormat;
}

/**
 * Creates a model response for the given chat conversation.
 */
export class ChatCompletionRequest {
    /**
     * A list of messages comprising the conversation so far.
     */
    @Type(() => ChatCompletionMessage)
    @Expose()
    messages: ChatCompletionMessage[];

    /**
     * ID of the model to use.
     */
    @Expose()
    model: string;
    /**
     * Whether to store the output of this chat completion request for use in OpenAI's model distillation or evals products.
     */
    @Expose()
    store?: boolean;

    /**
     * Developer-defined tags and values used for filtering completions in the OpenAI's dashboard.
     */
    @Expose()
    metadata?: Record<string, any>;

    /**
     * Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far,
     * decreasing the model's likelihood to repeat the same line verbatim.
     */
    @Expose({ name: 'frequency_penalty' })
    frequencyPenalty?: number;

    /**
     * Modify the likelihood of specified tokens appearing in the completion.
     * Accepts a JSON object that maps tokens (specified by their token ID in the tokenizer) to an associated bias value from -100 to 100.
     */
    @Expose({ name: 'logit_bias' })
    logitBias?: Record<string, number>;

    /**
     * Whether to return log probabilities of the output tokens or not.
     */
    @Expose()
    logprobs?: boolean;

    /**
     * An integer between 0 and 5 specifying the number of most likely tokens to return at each token position, each with an associated log probability.
     */
    @Expose({ name: 'top_logprobs' })
    topLogprobs?: number;

    /**
     * @deprecated The maximum number of tokens that can be generated in the chat completion. This value can be used to control costs for text generated via API.
     */
    @Expose({ name: 'max_tokens' })
    maxTokens?: number;

    /**
     * An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.
     */
    @Expose({ name: 'max_completion_tokens' })
    maxCompletionTokens?: number;

    /**
     * How many chat completion choices to generate for each input message.
     */
    @Expose()
    n?: number;

    /**
     * Output types that you would like the model to generate for this request.
     */
    @Expose({ name: 'output_modalities' })
    outputModalities?: OutputModality[];

    /**
     * Parameters for audio output. Required when audio output is requested with outputModalities: ["audio"].
     */
    @Expose({ name: 'audio_parameters' })
    @Type(() => AudioParameters)
    audioParameters?: AudioParameters;

    /**
     * Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far,
     * increasing the model's likelihood to talk about new topics.
     */
    @Expose({ name: 'presence_penalty' })
    presencePenalty?: number;

    /**
     * An object specifying the format that the model must output.
     */
    @Expose({ name: 'response_format' })
    @Type(() => ResponseFormat)
    responseFormat?: ResponseFormat;

    /**
     * If specified, our system will make a best effort to sample deterministically,
     * such that repeated requests with the same seed and parameters should return the same result.
     */
    @Expose()
    seed?: number;

    /**
     * Specifies the latency tier to use for processing the request.
     */
    @Expose({ name: 'service_tier' })
    serviceTier?: string;

    /**
     * Up to 4 sequences where the API will stop generating further tokens.
     */
    @Expose()
    stop?: string[];

    /**
     * Options for streaming response.
     */
    @Expose()
    stream?: boolean;

    /**
     * The format to return the response in. Currently, the only accepted value is "json".
     */
    @Expose({ name: 'stream_options' })
    @Type(() => StreamOptions)
    streamOptions?: StreamOptions;

    /**
     * What sampling temperature to use, between 0 and 1. Higher values like 0.8 will make the output more random,
     * while lower values like 0.2 will make it more focused and deterministic.
     */
    @Expose()
    temperature?: number;

    /**
     * An alternative to sampling with temperature, called nucleus sampling,
     * where the model considers the results of the tokens with top_p probability mass.
     */
    @Expose({ name: 'top_p' })
    topP?: number;

    /**
     * A list of tools the model may call. Currently, only functions are supported as a tool.
     */
    @Type(() => FunctionTool)
    tools?: FunctionTool[];

    /**
     * Controls which (if any) function is called by the model.
     */
    @Expose({ name: 'tool_choice' })
    toolChoice?: Record<string, any>;

    /**
     * If set to true, the model will call all functions in the tools list in parallel. Otherwise,
     * the model will call the functions in the tools list in the order they are provided.
     */
    @Expose({ name: 'parallel_tool_calls' })
    parallelToolCalls?: boolean;

    /**
     * A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.
     */
    @Expose()
    user?: string;

    /**
     * Static predicted output content, such as the content of a text file that is
     * being regenerated.
     */
    @Expose()
    prediction?: Prediction | null;

    /**
     * An optional signal to abort the request.
     */
    @Exclude()
    signal?: AbortSignal;
}
