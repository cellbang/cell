import {
    Embedding,
    EmbeddingModel,
    EmbeddingOptions,
    EmbeddingRequest,
    EmbeddingResponse,
    EmbeddingResponseMetadata,
    EmbeddingResultMetadata
} from '@celljs/ai-core';
import {
    EmbeddingRequest as OpenAIEmbeddingsRequest,
    OpenAIAPI,
} from '../api';
import { Assert, Autowired, Component, IllegalArgumentError, Logger } from '@celljs/core';
import { OpenAIEmbeddingOptions } from './openai-embedding-options';

@Component(EmbeddingModel)
export class OpenAIEmbeddingModel implements EmbeddingModel {

    @Autowired(OpenAIEmbeddingOptions)
    protected readonly defaultOptions: OpenAIEmbeddingOptions;

    /**
     * Low-level access to the OpenAI API.
     */
    @Autowired(OpenAIAPI)
    protected readonly chatApi: OpenAIAPI;

    @Autowired(Logger)
    protected readonly logger: Logger;

    public async call(request: EmbeddingRequest): Promise<EmbeddingResponse> {
        Assert.notEmpty(request.instructions, 'At least one text is required!');
        const openAIRequet = this.createOpenAIEmbeddingsRequest(request.instructions, request.options);
        const openAIResponse = (await this.chatApi.embed(openAIRequet)).body;
        Assert.notNull(openAIResponse, 'No embedding data available.');

        const embeddings: Embedding[] = openAIResponse.data.map(embedding => ({
            embedding: embedding.embedding,
            index: embedding.index,
            metadata: EmbeddingResultMetadata.EMPTY,
            output: embedding.embedding
        }));

        const embeddingResponseMetadata = <EmbeddingResponseMetadata>{
            model: openAIResponse.model,
            usage: openAIResponse.usage,
            extra: {}
        };
        Assert.notEmpty(embeddings, 'No embedding data available.');
        return {
            embeddings,
            result: embeddings[0],
            results: embeddings,
            metadata: embeddingResponseMetadata
        };

    }

    protected createOpenAIEmbeddingsRequest(inputContent: string[], options?: EmbeddingOptions): OpenAIEmbeddingsRequest<string[]> {
        let runtimeOptions: OpenAIEmbeddingOptions = OpenAIEmbeddingOptions.builder().build();
        if (options) {
            runtimeOptions = Object.assign(runtimeOptions, options);
        }

        runtimeOptions = Object.assign(this.defaultOptions, runtimeOptions);

        // Override the model.
        if (!runtimeOptions.model) {
            throw new IllegalArgumentError('Model is not set!');
        }
        const model = runtimeOptions.model;

        return new OpenAIEmbeddingsRequest<string[]>(
            inputContent,
            model,
            runtimeOptions.encodingFormat,
            runtimeOptions.dimensions,
            runtimeOptions.user
        );
    }

}
