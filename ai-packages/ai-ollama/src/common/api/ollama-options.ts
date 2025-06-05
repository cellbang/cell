import { EmbeddingOptions, FunctionCallback, FunctionCallingOptions } from '@celljs/ai-core';
import { Expose, Exclude, Type } from 'class-transformer';
import { OllamaModel } from './ollama-model';
import { Assert, Constant } from '@celljs/core';
/**
 * Helper class for creating strongly-typed Ollama options.
 */
@Constant(OllamaOptions, new OllamaOptions())
export class OllamaOptions implements FunctionCallingOptions, EmbeddingOptions {

    static readonly DEFAULT_MODEL = OllamaModel.MISTRAL;

    private static readonly NON_SUPPORTED_FIELDS = ['model', 'format', 'keep_alive', 'truncate'];

    /**
     * Whether to use NUMA. (Default: false)
     */
    @Expose({ name: 'numa' })
    useNUMA?: boolean;

    /**
     * Sets the size of the context window used to generate the next token. (Default: 2048)
     */
    @Expose({ name: 'num_ctx' })
    numCtx?: number;

    /**
     * Prompt processing maximum batch size. (Default: 512)
     */
    @Expose({ name: 'num_batch' })
    numBatch?: number;

    /**
     * The number of layers to send to the GPU(s). On macOS, it defaults to 1
     * to enable metal support, 0 to disable.
     * (Default: -1, which indicates that numGPU should be set dynamically)
     */
    @Expose({ name: 'num_gpu' })
    numGPU?: number;

    /**
     * When using multiple GPUs this option controls which GPU is used
     * for small tensors for which the overhead of splitting the computation
     * across all GPUs is not worthwhile. The GPU in question will use slightly
     * more VRAM to store a scratch buffer for temporary results.
     * By default, GPU 0 is used.
     */
    @Expose({ name: 'main_gpu' })
    mainGPU?: number;

    /**
     * (Default: false)
     */
    @Expose({ name: 'low_vram' })
    lowVRAM?: boolean;

    /**
     * (Default: true)
     */
    @Expose({ name: 'f16_kv' })
    f16KV?: boolean;

    /**
     * Return logits for all the tokens, not just the last one.
     * To enable completions to return logprobs, this must be true.
     */
    @Expose({ name: 'logits_all' })
    logitsAll?: boolean;

    /**
     * Load only the vocabulary, not the weights.
     */
    @Expose({ name: 'vocab_only' })
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
    @Expose({ name: 'use_mmap' })
    useMMap?: boolean;

    /**
     * Lock the model in memory, preventing it from being swapped out when memory-mapped.
     * This can improve performance but trades away some of the advantages of memory-mapping
     * by requiring more RAM to run and potentially slowing down load times as the model loads into RAM.
     * (Default: false)
     */
    @Expose({ name: 'use_mlock' })
    useMLock?: boolean;

    /**
     * Set the number of threads to use during generation. For optimal performance, it is recommended to set this value
     * to the number of physical CPU cores your system has (as opposed to the logical number of cores).
     * Using the correct number of threads can greatly improve performance.
     * By default, Ollama will detect this value for optimal performance.
     */
    @Expose({ name: 'num_thread' })
    numThread?: number;

    /**
     * (Default: 4)
     */
    @Expose({ name: 'num_keep' })
    numKeep?: number;

    /**
     * Sets the random number seed to use for generation. Setting this to a
     * specific number will make the model generate the same text for the same prompt.
     * (Default: -1)
     */
    @Expose()
    seed?: number;

    /**
     * Maximum number of tokens to predict when generating text.
     * (Default: 128, -1 = infinite generation, -2 = fill context)
     */
    @Expose({ name: 'num_predict' })
    numPredict?: number;

    /**
     * Reduces the probability of generating nonsense. A higher value (e.g.
     * 100) will give more diverse answers, while a lower value (e.g. 10) will be more
     * conservative. (Default: 40)
     */
    @Expose({ name: 'top_k' })
    topK?: number;

    /**
     * Works together with top-k. A higher value (e.g., 0.95) will lead to
     * more diverse text, while a lower value (e.g., 0.5) will generate more focused and
     * conservative text. (Default: 0.9)
     */
    @Expose({ name: 'top_p' })
    topP?: number;

    /**
     * Tail free sampling is used to reduce the impact of less probable tokens
     * from the output. A higher value (e.g., 2.0) will reduce the impact more, while a
     * value of 1.0 disables this setting. (default: 1)
     */
    @Expose({ name: 'tfs_z' })
    tfsZ?: number;

    /**
     * (Default: 1.0)
     */
    @Expose({ name: 'typical_p' })
    typicalP?: number;

    /**
     * Sets how far back for the model to look back to prevent
     * repetition. (Default: 64, 0 = disabled, -1 = num_ctx)
     */
    @Expose({ name: 'repeat_last_n' })
    repeatLastN?: number;

    /**
     * The temperature of the model. Increasing the temperature will
     * make the model answer more creatively. (Default: 0.8)
     */
    @Expose()
    temperature?: number;

    /**
     * Sets how strongly to penalize repetitions. A higher value
     * (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g.,
     * 0.9) will be more lenient. (Default: 1.1)
     */
    @Expose({ name: 'repeat_penalty' })
    repeatPenalty?: number;

    /**
     * (Default: 0.0)
     */
    @Expose({ name: 'presence_penalty' })
    presencePenalty?: number;

    /**
     * (Default: 0.0)
     */
    @Expose({ name: 'frequency_penalty' })
    frequencyPenalty?: number;

    /**
     * Enable Mirostat sampling for controlling perplexity. (default: 0, 0
     * = disabled, 1 = Mirostat, 2 = Mirostat 2.0)
     */
    @Expose()
    mirostat?: number;

    /**
     * Controls the balance between coherence and diversity of the output.
     * A lower value will result in more focused and coherent text. (Default: 5.0)
     */
    @Expose({ name: 'mirostat_tau' })
    mirostatTau?: number;

    /**
     * Influences how quickly the algorithm responds to feedback from the generated text.
     * A lower learning rate will result in slower adjustments, while a higher learning rate
     * will make the algorithm more responsive. (Default: 0.1)
     */
    @Expose({ name: 'mirostat_eta' })
    mirostatEta?: number;

    /**
     * (Default: true)
     */
    @Expose({ name: 'penalize_newline' })
    penalizeNewline?: boolean;

    /**
     * Sets the stop sequences to use. When this pattern is encountered the
     * LLM will stop generating text and return. Multiple stop patterns may be set by
     * specifying multiple separate stop parameters in a modelfile.
     */
    @Type(() => String)
    stop?: string[];

    /**
     * NOTE: Synthetic field not part of the official Ollama API.
     * Used to allow overriding the model name with prompt options.
     * Part of Chat completion <a href="https://github.com/ollama/ollama/blob/main/docs/api.md#parameters-1">parameters</a>.
     */
    @Expose()
    model?: string;

    /**
     * Sets the desired format of output from the LLM. The only valid values are null or "json".
     * Part of Chat completion <a href="https://github.com/ollama/ollama/blob/main/docs/api.md#parameters-1">advanced parameters</a>.
     */
    @Expose()
    format?: string;

    /**
     * Sets the length of time for Ollama to keep the model loaded. Valid values for this
     * setting are parsed by <a href="https://pkg.go.dev/time#ParseDuration">ParseDuration in Go</a>.
     * Part of Chat completion <a href="https://github.com/ollama/ollama/blob/main/docs/api.md#parameters-1">advanced parameters</a>.
     */
    @Expose({ name: 'keep_alive' })
    keepAlive?: string;

    /**
     * Truncates the end of each input to fit within context length. Returns error if false and context length is exceeded.
     * Defaults to true.
     */
    @Expose()
    truncate?: boolean;

    /**
     * Tool Function Callbacks to register with the ChatModel.
     * For Prompt Options the functionCallbacks are automatically enabled for the duration of the prompt execution.
     * For Default Options the functionCallbacks are registered but disabled by default. Use the enableFunctions to set the functions
     * from the registry to be used by the ChatModel chat completion requests.
     */
    @Exclude()
    functionCallbacks: FunctionCallback[] = [];

    /**
     * List of functions, identified by their names, to configure for function calling in
     * the chat completion requests.
     * Functions with those names must exist in the functionCallbacks registry.
     * The functionCallbacks from the PromptOptions are automatically enabled for the duration of the prompt execution.
     * Note that function enabled with the default options are enabled for all chat completion requests. This could impact the token count and the billing.
     * If the functions is set in a prompt options, then the enabled functions are only active for the duration of this prompt execution.
     */
    @Exclude()
    functions: Set<string> = new Set<string>();

    @Exclude()
    proxyToolCalls?: boolean;

    copy(): OllamaOptions {
        return OllamaOptions.options(this);
    }

    /**
     * Filter out the non-supported fields from the options.
     * @param options The options to filter.
     * @returns The filtered options.
     */
    static filterNonSupportedFields(options: Record<string, any>): Record<string, any> {
        const filteredOptions: Record<string, any> = {};
        for (const key in options) {
            if (!OllamaOptions.NON_SUPPORTED_FIELDS.includes(key)) {
                filteredOptions[key] = options[key];
            }
        }
        return filteredOptions;
    }

    static options(fromOptions: OllamaOptions): OllamaOptions {
        const options = fromOptions as Required<OllamaOptions>;
        return new OllamaOptionsBuilder()
            .withModel(options.model)
            .withFormat(options.format)
            .withKeepAlive(options.keepAlive)
            .withTruncate(options.truncate)
            .withUseNUMA(options.useNUMA)
            .withNumCtx(options.numCtx)
            .withNumBatch(options.numBatch)
            .withNumGPU(options.numGPU)
            .withMainGPU(options.mainGPU)
            .withLowVRAM(options.lowVRAM)
            .withF16KV(options.f16KV)
            .withLogitsAll(options.logitsAll)
            .withVocabOnly(options.vocabOnly)
            .withUseMMap(options.useMMap)
            .withUseMLock(options.useMLock)
            .withNumThread(options.numThread)
            .withNumKeep(options.numKeep)
            .withSeed(options.seed)
            .withNumPredict(options.numPredict)
            .withTopK(options.topK)
            .withTopP(options.topP)
            .withTfsZ(options.tfsZ)
            .withTypicalP(options.typicalP)
            .withRepeatLastN(options.repeatLastN)
            .withTemperature(options.temperature)
            .withRepeatPenalty(options.repeatPenalty)
            .withPresencePenalty(options.presencePenalty)
            .withFrequencyPenalty(options.frequencyPenalty)
            .withMirostat(options.mirostat)
            .withMirostatTau(options.mirostatTau)
            .withMirostatEta(options.mirostatEta)
            .withPenalizeNewline(options.penalizeNewline)
            .withStop(options.stop)
            .withFunctions(options.functions)
            .withProxyToolCalls(options.proxyToolCalls)
            .withFunctionCallbacks(options.functionCallbacks)
            .build();
    }

    static builder(): OllamaOptionsBuilder {
        return new OllamaOptionsBuilder();
    }

}

export class OllamaOptionsBuilder {
    private model?: string;
    private format?: string;
    private keepAlive?: string;
    private truncate?: boolean;
    private useNUMA?: boolean;
    private numCtx?: number;
    private numBatch?: number;
    private numGPU?: number;
    private mainGPU?: number;
    private lowVRAM?: boolean;
    private f16KV?: boolean;
    private logitsAll?: boolean;
    private vocabOnly?: boolean;
    private useMMap?: boolean;
    private useMLock?: boolean;
    private numThread?: number;
    private numKeep?: number;
    private seed?: number;
    private numPredict?: number;
    private topK?: number;
    private topP?: number;
    private tfsZ?: number;
    private typicalP?: number;
    private repeatLastN?: number;
    private temperature?: number;
    private repeatPenalty?: number;
    private presencePenalty?: number;
    private frequencyPenalty?: number;
    private mirostat?: number;
    private mirostatTau?: number;
    private mirostatEta?: number;
    private penalizeNewline?: boolean;
    private stop?: string[];
    private functionCallbacks?: FunctionCallback[];
    private functions: Set<string> = new Set();
    private proxyToolCalls?: boolean;

    build(): OllamaOptions {
        const options = new OllamaOptions();
        options.model = this.model;
        options.format = this.format;
        options.keepAlive = this.keepAlive;
        options.truncate = this.truncate;
        options.useNUMA = this.useNUMA;
        options.numCtx = this.numCtx;
        options.numBatch = this.numBatch;
        options.numGPU = this.numGPU;
        options.mainGPU = this.mainGPU;
        options.lowVRAM = this.lowVRAM;
        options.f16KV = this.f16KV;
        options.logitsAll = this.logitsAll;
        options.vocabOnly = this.vocabOnly;
        options.useMMap = this.useMMap;
        options.useMLock = this.useMLock;
        options.numThread = this.numThread;
        options.numKeep = this.numKeep;
        options.seed = this.seed;
        options.numPredict = this.numPredict;
        options.topK = this.topK;
        options.topP = this.topP;
        options.tfsZ = this.tfsZ;
        options.typicalP = this.typicalP;
        options.repeatLastN = this.repeatLastN;
        options.temperature = this.temperature;
        options.repeatPenalty = this.repeatPenalty;
        options.presencePenalty = this.presencePenalty;
        options.frequencyPenalty = this.frequencyPenalty;
        options.mirostat = this.mirostat;
        options.mirostatTau = this.mirostatTau;
        options.mirostatEta = this.mirostatEta;
        options.penalizeNewline = this.penalizeNewline;
        options.stop = this.stop;
        options.functionCallbacks = this.functionCallbacks ?? [];
        options.functions = this.functions;
        options.proxyToolCalls = this.proxyToolCalls;
        return options;
    }

    /**
     * @param model The ollama model names to use. See the {@link OllamaModel} for the common models.
     */
    withModel(model: OllamaModel | string): OllamaOptionsBuilder {
        this.model = model;
        return this;
    }

    withFormat(format: string): OllamaOptionsBuilder {
        this.format = format;
        return this;
    }

    withKeepAlive(keepAlive: string): OllamaOptionsBuilder {
        this.keepAlive = keepAlive;
        return this;
    }

    withTruncate(truncate: boolean): OllamaOptionsBuilder {
        this.truncate = truncate;
        return this;
    }

    withUseNUMA(useNUMA: boolean): OllamaOptionsBuilder {
        this.useNUMA = useNUMA;
        return this;
    }

    withNumCtx(numCtx: number): OllamaOptionsBuilder {
        this.numCtx = numCtx;
        return this;
    }

    withNumBatch(numBatch: number): OllamaOptionsBuilder {
        this.numBatch = numBatch;
        return this;
    }

    withNumGPU(numGPU: number): OllamaOptionsBuilder {
        this.numGPU = numGPU;
        return this;
    }

    withMainGPU(mainGPU: number): OllamaOptionsBuilder {
        this.mainGPU = mainGPU;
        return this;
    }

    withLowVRAM(lowVRAM: boolean): OllamaOptionsBuilder {
        this.lowVRAM = lowVRAM;
        return this;
    }

    withF16KV(f16KV: boolean): OllamaOptionsBuilder {
        this.f16KV = f16KV;
        return this;
    }

    withLogitsAll(logitsAll: boolean): OllamaOptionsBuilder {
        this.logitsAll = logitsAll;
        return this;
    }

    withVocabOnly(vocabOnly: boolean): OllamaOptionsBuilder {
        this.vocabOnly = vocabOnly;
        return this;
    }

    withUseMMap(useMMap: boolean): OllamaOptionsBuilder {
        this.useMMap = useMMap;
        return this;
    }

    withUseMLock(useMLock: boolean): OllamaOptionsBuilder {
        this.useMLock = useMLock;
        return this;
    }

    withNumThread(numThread: number): OllamaOptionsBuilder {
        this.numThread = numThread;
        return this;
    }

    withNumKeep(numKeep: number): OllamaOptionsBuilder {
        this.numKeep = numKeep;
        return this;
    }

    withSeed(seed: number): OllamaOptionsBuilder {
        this.seed = seed;
        return this;
    }

    withNumPredict(numPredict: number): OllamaOptionsBuilder {
        this.numPredict = numPredict;
        return this;
    }

    withTopK(topK: number): OllamaOptionsBuilder {
        this.topK = topK;
        return this;
    }

    withTopP(topP: number): OllamaOptionsBuilder {
        this.topP = topP;
        return this;
    }

    withTfsZ(tfsZ: number): OllamaOptionsBuilder {
        this.tfsZ = tfsZ;
        return this;
    }

    withTypicalP(typicalP: number): OllamaOptionsBuilder {
        this.typicalP = typicalP;
        return this;
    }

    withRepeatLastN(repeatLastN: number): OllamaOptionsBuilder {
        this.repeatLastN = repeatLastN;
        return this;
    }

    withTemperature(temperature: number): OllamaOptionsBuilder {
        this.temperature = temperature;
        return this;
    }

    withRepeatPenalty(repeatPenalty: number): OllamaOptionsBuilder {
        this.repeatPenalty = repeatPenalty;
        return this;
    }

    withPresencePenalty(presencePenalty: number): OllamaOptionsBuilder {
        this.presencePenalty = presencePenalty;
        return this;
    }

    withFrequencyPenalty(frequencyPenalty: number): OllamaOptionsBuilder {
        this.frequencyPenalty = frequencyPenalty;
        return this;
    }

    withMirostat(mirostat: number): OllamaOptionsBuilder {
        this.mirostat = mirostat;
        return this;
    }

    withMirostatTau(mirostatTau: number): OllamaOptionsBuilder {
        this.mirostatTau = mirostatTau;
        return this;
    }

    withMirostatEta(mirostatEta: number): OllamaOptionsBuilder {
        this.mirostatEta = mirostatEta;
        return this;
    }

    withPenalizeNewline(penalizeNewline: boolean): OllamaOptionsBuilder {
        this.penalizeNewline = penalizeNewline;
        return this;
    }

    withStop(stop: string[]): OllamaOptionsBuilder {
        this.stop = stop;
        return this;
    }

    withFunctionCallbacks(functionCallbacks: FunctionCallback[]): OllamaOptionsBuilder {
        this.functionCallbacks = functionCallbacks;
        return this;
    }

    withFunctions(functions: Set<string>): OllamaOptionsBuilder {
        this.functions = functions;
        return this;
    }

    withFunction(functionName: string): OllamaOptionsBuilder {
        Assert.hasText(functionName, 'Function name must not be empty');
        this.functions.add(functionName);
        return this;
    }

    withProxyToolCalls(proxyToolCalls: boolean): OllamaOptionsBuilder {
        this.proxyToolCalls = proxyToolCalls;
        return this;
    }
}
