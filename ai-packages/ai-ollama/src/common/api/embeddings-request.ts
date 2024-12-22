import { Expose } from 'class-transformer';

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
export class EmbeddingsRequest {
    @Expose()
    model: string;

    @Expose()
    input: string[];

    @Expose({ name: 'keep_alive' })
    keepAlive?: string;

    @Expose()
    options?: Record<string, any>;

    @Expose()
    truncate?: boolean;

    constructor(
        model: string,
        input: string[],
        keepAlive?: string,
        options?: Record<string, any>,
        truncate?: boolean
    ) {
        this.model = model;
        this.input = input;
        this.keepAlive = keepAlive;
        this.options = options;
        this.truncate = truncate;
    }

    /**
     * Shortcut constructor to create a EmbeddingRequest without options.
     * @param model The name of model to generate embeddings from.
     * @param input The text or list of text to generate embeddings for.
     */
    static fromSingleInput(model: string, input: string): EmbeddingsRequest {
        return new EmbeddingsRequest(model, [input]);
    }
}
