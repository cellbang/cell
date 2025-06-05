import { EmbeddingOptions } from '@celljs/ai-core';
import { Expose } from 'class-transformer';
import { Constant } from '@celljs/core';

/**
 * OpenAI Embedding Options.
 */
@Constant(OpenAIEmbeddingOptions, new OpenAIEmbeddingOptions())
export class OpenAIEmbeddingOptions implements EmbeddingOptions {
    /**
     * ID of the model to use.
     */
    @Expose()
    model?: string;

    /**
     * The format to return the embeddings in. Can be either float or base64.
     */
    @Expose({ name: 'encoding_format' })
    encodingFormat?: string;

    /**
     * The number of dimensions the resulting output embeddings should have.
     * Only supported in text-embedding-3 and later models.
     */
    @Expose()
    dimensions?: number;

    /**
     * A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.
     */
    @Expose()
    user?: string;

    copy(): OpenAIEmbeddingOptions {
        return OpenAIEmbeddingOptions.options(this);
    }

    static options(fromOptions: OpenAIEmbeddingOptions): OpenAIEmbeddingOptions {
        const options = new OpenAIEmbeddingOptions();
        return Object.assign(options, fromOptions);
    }

    static builder(): OpenAIEmbeddingOptionsBuilder {
        return new OpenAIEmbeddingOptionsBuilder();
    }
}

export class OpenAIEmbeddingOptionsBuilder {
    private options = new OpenAIEmbeddingOptions();

    withModel(model: string): OpenAIEmbeddingOptionsBuilder {
        this.options.model = model;
        return this;
    }

    withEncodingFormat(encodingFormat: string): OpenAIEmbeddingOptionsBuilder {
        this.options.encodingFormat = encodingFormat;
        return this;
    }

    withDimensions(dimensions: number): OpenAIEmbeddingOptionsBuilder {
        this.options.dimensions = dimensions;
        return this;
    }

    withUser(user: string): OpenAIEmbeddingOptionsBuilder {
        this.options.user = user;
        return this;
    }

    build(): OpenAIEmbeddingOptions {
        return OpenAIEmbeddingOptions.options(this.options);
    }
}
