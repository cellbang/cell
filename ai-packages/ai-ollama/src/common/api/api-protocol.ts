import { ChatOptions, EmbeddingOptions, FunctionCallback, FunctionCallingOptions } from '@celljs/ai-core';
import { Observable } from 'rxjs';
import { Expose } from 'class-transformer';

export const OllamaAPI = Symbol('OllamaAPI');

/**
 * Helper class for creating strongly-typed Ollama options.
 */
export class OllamaOptions implements FunctionCallingOptions, ChatOptions, EmbeddingOptions {

    /**
     * Whether to use NUMA. (Default: false)
     */
    @Expose({ name: 'numa' })
    useNUMA?: boolean;

    /**
     * Sets the size of the context window used to generate the next token. (Default: 2048)
     */
    numCtx?: number;

    /**
     * Prompt processing maximum batch size. (Default: 512)
     */
    numBatch?: number;

    /**
     * The number of layers to send to the GPU(s). On macOS, it defaults to 1
     * to enable metal support, 0 to disable.
     * (Default: -1, which indicates that numGPU should be set dynamically)
     */
    numGPU?: number;

    /**
     * When using multiple GPUs this option controls which GPU is used
     * for small tensors for which the overhead of splitting the computation
     * across all GPUs is not worthwhile. The GPU in question will use slightly
     * more VRAM to store a scratch buffer for temporary results.
     * By default, GPU 0 is used.
     */
    mainGPU?: number;

    /**
     * (Default: false)
     */
    lowVRAM?: boolean;

    /**
     * (Default: true)
     */
    f16KV?: boolean;

    /**
     * Return logits for all the tokens, not just the last one.
     * To enable completions to return logprobs, this must be true.
     */
    logitsAll?: boolean;

    /**
     * Load only the vocabulary, not the weights.
     */
    vocabOnly?: boolean;

    /**
     * By default, models are mapped into memory, which allows the system to load only the necessary parts
     * of the model as needed. However, if the model is larger than your total amount of RAM or if your system is low
     * on available memory, using mmap might increase the risk of pageouts, negatively impacting performance.
     * Disabling mmap results in slower load times but may reduce pageouts if you're not using mlock.
     * Note that if the model is larger than the total amount of RAM, turning off mmap would prevent
     * the model from loading at all.
     * (Default: null)
     */
    useMMap?: boolean;

    /**
     * Lock the model in memory, preventing it from being swapped out when memory-mapped.
     * This can improve performance but trades away some of the advantages of memory-mapping
     * by requiring more RAM to run and potentially slowing down load times as the model loads into RAM.
     * (Default: false)
     */
    useMLock?: boolean;

    /**
     * Set the number of threads to use during generation. For optimal performance, it is recommended to set this value
     * to the number of physical CPU cores your system has (as opposed to the logical number of cores).
     * Using the correct number of threads can greatly improve performance.
     * By default, Ollama will detect this value for optimal performance.
     */
    numThread?: number;

    // Following fields are predict options used at runtime.

    /**
     * (Default: 4)
     */
    numKeep?: number;

    /**
     * Sets the random number seed to use for generation. Setting this to a
     * specific number will make the model generate the same text for the same prompt.
     * (Default: -1)
     */
    seed?: number;

    /**
     * Maximum number of tokens to predict when generating text.
     * (Default: 128, -1 = infinite generation, -2 = fill context)
     */
    numPredict?: number;

    /**
     * Reduces the probability of generating nonsense. A higher value (e.g.
     * 100) will give more diverse answers, while a lower value (e.g. 10) will be more
     * conservative. (Default: 40)
     */
    topK?: number;

    /**
     * Works together with top-k. A higher value (e.g., 0.95) will lead to
     * more diverse text, while a lower value (e.g., 0.5) will generate more focused and
     * conservative text. (Default: 0.9)
     */
    topP?: number;

    /**
     * Tail free sampling is used to reduce the impact of less probable tokens
     * from the output. A higher value (e.g., 2.0) will reduce the impact more, while a
     * value of 1.0 disables this setting. (default: 1)
     */
    tfsZ?: number;

    /**
     * (Default: 1.0)
     */
    typicalP?: number;

    /**
     * Sets how far back for the model to look back to prevent
     * repetition. (Default: 64, 0 = disabled, -1 = num_ctx)
     */
    repeatLastN?: number;

    /**
     * The temperature of the model. Increasing the temperature will
     * make the model answer more creatively. (Default: 0.8)
     */
    temperature?: number;

    /**
     * Sets how strongly to penalize repetitions. A higher value
     * (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g.,
     * 0.9) will be more lenient. (Default: 1.1)
     */
    repeatPenalty?: number;

    /**
     * (Default: 0.0)
     */
    presencePenalty?: number;

    /**
     * (Default: 0.0)
     */
    frequencyPenalty?: number;

    /**
     * Enable Mirostat sampling for controlling perplexity. (default: 0, 0
     * = disabled, 1 = Mirostat, 2 = Mirostat 2.0)
     */
    mirostat?: number;

    /**
     * Controls the balance between coherence and diversity of the output.
     * A lower value will result in more focused and coherent text. (Default: 5.0)
     */
    mirostatTau?: number;

    /**
     * Influences how quickly the algorithm responds to feedback from the generated text.
     * A lower learning rate will result in slower adjustments, while a higher learning rate
     * will make the algorithm more responsive. (Default: 0.1)
     */
    mirostatEta?: number;

    /**
     * (Default: true)
     */
    penalizeNewline?: boolean;

    /**
     * Sets the stop sequences to use. When this pattern is encountered the
     * LLM will stop generating text and return. Multiple stop patterns may be set by
     * specifying multiple separate stop parameters in a modelfile.
     */
    stop?: string[];

    // Following fields are not part of the Ollama Options API but part of the Request.

    /**
     * NOTE: Synthetic field not part of the official Ollama API.
     * Used to allow overriding the model name with prompt options.
     * Part of Chat completion <a href="https://github.com/ollama/ollama/blob/main/docs/api.md#parameters-1">parameters</a>.
     */
    model?: string;

    /**
     * Sets the desired format of output from the LLM. The only valid values are null or "json".
     * Part of Chat completion <a href="https://github.com/ollama/ollama/blob/main/docs/api.md#parameters-1">advanced parameters</a>.
     */
    format?: string;

    /**
     * Sets the length of time for Ollama to keep the model loaded. Valid values for this
     * setting are parsed by <a href="https://pkg.go.dev/time#ParseDuration">ParseDuration in Go</a>.
     * Part of Chat completion <a href="https://github.com/ollama/ollama/blob/main/docs/api.md#parameters-1">advanced parameters</a>.
     */
    keepAlive?: string;

    /**
     * Truncates the end of each input to fit within context length. Returns error if false and context length is exceeded.
     * Defaults to true.
     */
    truncate?: boolean;

    functionCallbacks: FunctionCallback[];
    functions: Set<String>;
}

/**
 * Chat message object.
 *
 * @param role The role of the message of type {@link Role}.
 * @param content The content of the message.
 * @param images The list of base64-encoded images to send with the message.
 * Requires multimodal models such as llava or bakllava.
 */
export interface Message {
    role: Role;
    content: string;
    images?: string[];
    toolCalls?: ToolCall[];
}

/**
 * The role of the message in the conversation.
 */
export enum Role {
    /**
     * System message type used as instructions to the model.
     */
    SYSTEM = 'system',
    /**
     * User message type.
     */
    USER = 'user',
    /**
     * Assistant message type. Usually the response from the model.
     */
    ASSISTANT = 'assistant',
    /**
     * Tool message.
     */
    TOOL = 'tool'
}

/**
 * The relevant tool call.
 *
 * @param function The function definition.
 */
export interface ToolCall {
    function?: ToolCallFunction;
}

/**
 * The function definition.
 *
 * @param name The name of the function.
 * @param arguments The arguments that the model expects you to pass to the function.
 */
export interface ToolCallFunction {
    name: string;
    arguments: { [key: string]: any };
}

/**
 * Chat request object.
 *
 * @param model The model to use for completion. It should be a name familiar to Ollama from the <a href="https://ollama.com/library">Library</a>.
 * @param messages The list of messages in the chat. This can be used to keep a chat memory.
 * @param stream Whether to stream the response. If false, the response will be returned as a single response object rather than a stream of objects.
 * @param format The format to return the response in. Currently, the only accepted value is "json".
 * @param keepAlive Controls how long the model will stay loaded into memory following this request (default: 5m).
 * @param tools List of tools the model has access to.
 * @param options Model-specific options. For example, "temperature" can be set through this field, if the model supports it.
 * You can use the {@link OllamaOptions} builder to create the options then {@link OllamaOptions#toMap()} to convert the options into a map.
 */
export interface ChatRequest {
    model: string;
    messages: Message[];
    stream?: boolean;
    format: string;
    keepAlive?: string;
    tools?: Tool[];
    options?: { [key: string]: any };
}

/**
 * Represents a tool the model may call. Currently, only functions are supported as a tool.
 *
 * @param type The type of the tool. Currently, only 'function' is supported.
 * @param function The function definition.
 */
export interface Tool {
    type: ToolType;
    function: FunctionDefinition;
}

/**
 * Tool type enumeration.
 */
enum ToolType {
    FUNCTION = 'function'
}

/**
 * Function definition.
 *
 * @param name The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes.
 * @param description A description of what the function does, used by the model to choose when and how to call the function.
 * @param parameters The parameters the functions accepts, described as a JSON Schema object. To describe a function that accepts no parameters,
 * provide the value {"type": "object", "properties": {}}.
 */
interface FunctionDefinition {
    name: string;
    description: string;
    parameters: { [key: string]: any };
}

/**
 * Create tool function definition.
 *
 * @param description tool function description.
 * @param name tool function name.
 * @param jsonSchema tool function schema as json.
 */
class FunctionDefinition {
    constructor(description: string, name: string, jsonSchema: string) {
        this.description = description;
        this.name = name;
        this.parameters = JSON.parse(jsonSchema);
    }
}

/**
 * Ollama chat response object.
 *
 * @param model The model used for generating the response.
 * @param createdAt The timestamp of the response generation.
 * @param message The response {@link Message} with {@link Message.Role#ASSISTANT}.
 * @param doneReason The reason the model stopped generating text.
 * @param done Whether this is the final response. For streaming response only the
 * last message is marked as done. If true, this response may be followed by another
 * response with the following, additional fields: context, prompt_eval_count,
 * prompt_eval_duration, eval_count, eval_duration.
 * @param totalDuration Time spent generating the response.
 * @param loadDuration Time spent loading the model.
 * @param promptEvalCount Number of tokens in the prompt.
 * @param promptEvalDuration Time spent evaluating the prompt.
 * @param evalCount Number of tokens in the response.
 * @param evalDuration Time spent generating the response.
 */
export interface ChatResponse {
    model: string;
    createdAt: Date;
    message: Message;
    doneReason: string;
    done: boolean;
    totalDuration: number;
    loadDuration: number;
    promptEvalCount: number;
    promptEvalDuration: number;
    evalCount: number;
    evalDuration: number;
}

/**
 * Generate embeddings from a model.
 *
 * @param model The name of model to generate embeddings from.
 * @param input The text or list of text to generate embeddings for.
 * @param keepAlive Controls how long the model will stay loaded into memory following the request (default: 5m).
 * @param options Additional model parameters listed in the documentation for the
 * @param truncate Truncates the end of each input to fit within context length.
 *  Returns error if false and context length is exceeded. Defaults to true.
 */
export interface EmbeddingsRequest {
    /**
     * The name of model to generate embeddings from.
     */
    model: string;

    /**
     * The text or list of text to generate embeddings for.
     */
    input: string[];

    /**
     * Controls how long the model will stay loaded into memory following the request (default: 5m).
     */
    keepAlive?: string;

    /**
     * Additional model parameters listed in the documentation for the
     */
    options?: Record<string, any>;

    /**
     * Truncates the end of each input to fit within context length.
     * Returns error if false and context length is exceeded. Defaults to true.
     */
    truncate?: boolean;
}

/**
 * Generate embeddings from a model.
 *
 * @param model The name of model to generate embeddings from.
 * @param prompt The text generate embeddings for
 * @param keepAlive Controls how long the model will stay loaded into memory following the request (default: 5m).
 * @param options Additional model parameters listed in the documentation for the
 * @deprecated Use {@link EmbeddingsRequest} instead.
 */
export interface EmbeddingRequest {
    /**
     * The name of model to generate embeddings from.
     */
    model: string;

    /**
     * The text to generate embeddings for.
     */
    prompt: string;

    /**
     * Controls how long the model will stay loaded into memory following the request (default: 5m).
     */
    keepAlive?: string;

    /**
     * Additional model parameters listed in the documentation for the
     */
    options?: Record<string, any>;
}

/**
 * The response object returned from the /embedding endpoint.
 * @param model The model used for generating the embeddings.
 * @param embeddings The list of embeddings generated from the model.
 * Each embedding (list of doubles) corresponds to a single input text.
 */
export interface EmbeddingsResponse {
    /**
     * The model used for generating the embeddings.
     */
    model: string;

    /**
     * The list of embeddings generated from the model.
     * Each embedding (list of doubles) corresponds to a single input text.
     */
    embeddings: number[][];
}

export interface OllamaAPI {
    /**
     * Generate the next message in a chat with a provided model.
     * This is a streaming endpoint (controlled by the 'stream' request property), so
     * there will be a series of responses. The final response object will include
     * statistics and additional data from the request.
     * @param chatRequest Chat request.
     * @return Chat response.
     */
    chat(chatRequest: ChatRequest): Promise<ChatResponse>;
    /**
     * Streaming response for the chat completion request.
     * @param chatRequest Chat request. The request must set the stream property to true.
     * @return Chat response as a {@link Flux} stream.
     */
    streamingChat(chatRequest: ChatRequest): Observable<ChatResponse>;
    /**
     * Generate embeddings from a model.
     * @param embeddingsRequest Embedding request.
     * @return Embeddings response.
     */
    embed(embeddingsRequest: EmbeddingsRequest): Promise<EmbeddingsResponse>;

}
