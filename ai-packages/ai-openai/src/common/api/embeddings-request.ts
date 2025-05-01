import { Exclude, Expose } from 'class-transformer';

/**
 * Represents an embedding vector returned by embedding endpoint.
 */
export class Embedding {
    /**
     * The index of the embedding in the list of embeddings.
     */
    index: number;

    /**
     * The embedding vector, which is a list of floats. The length of vector depends on the model.
     */
    embedding: number[];

    /**
     * The object type, which is always 'embedding'.
     */
    object: string;

    constructor(index: number, embedding: number[], object = 'embedding') {
        this.index = index;
        this.embedding = embedding;
        this.object = object;
    }
}

/**
 * Creates an embedding vector representing the input text.
 */
export class EmbeddingRequest<T> {
    /**
     * Input text to embed, encoded as a string or array of tokens. To embed multiple inputs in a single request,
     * pass an array of strings or array of token arrays.
     * The input must not exceed the max input tokens for the model (8192 tokens for text-embedding-ada-002),
     * cannot be an empty string, and any array must be 2048 dimensions or less.
     */
    input: T;

    /**
     * ID of the model to use.
     */
    model: string;

    /**
     * The format to return the embeddings in. Can be either float or base64.
     */
    @Expose({ name: 'encoding_format' })
    encodingFormat: string;

    /**
     * The number of dimensions the resulting output embeddings should have. Only supported in text-embedding-3 and later models.
     */
    dimensions?: number;

    /**
     * A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.
     */
    user?: string;

    /**
     * An optional signal to abort the request.
     */
    @Exclude()
    signal?: AbortSignal;

    constructor(
        input: T,
        model: string,
        encodingFormat = 'float',
        dimensions?: number,
        user?: string,
        signal?: AbortSignal
    ) {
        this.input = input;
        this.model = model;
        this.encodingFormat = encodingFormat;
        this.dimensions = dimensions;
        this.user = user;
        this.signal = signal;
    }

    /**
     * Create an embedding request with the given input, model and encoding format set to float.
     * @param input Input text to embed.
     * @param model ID of the model to use.
     */
    static fromInputAndModel<T>(input: T, model: string): EmbeddingRequest<T> {
        return new EmbeddingRequest(input, model);
    }

    /**
     * Create an embedding request with the given input. Encoding format is set to float and user is null and the model is set to 'text-embedding-ada-002'.
     * @param input Input text to embed.
     */
    static fromInput<T>(input: T): EmbeddingRequest<T> {
        return new EmbeddingRequest(input, 'text-embedding-ada-002');
    }
}
