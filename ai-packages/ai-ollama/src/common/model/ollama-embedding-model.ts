import {
    Embedding,
    EmbeddingModel,
    EmbeddingOptions,
    EmbeddingRequest,
    EmbeddingResponse,
    EmbeddingResponseMetadata,
    EmbeddingResultMetadata,
    Usage
} from '@celljs/ai-core';
import {
    EmbeddingsRequest as OllamaEmbeddingsRequest,
    OllamaOptions,
    OllamaAPI
} from '../api';
import { Assert, Autowired, Component, IllegalArgumentError } from '@celljs/core';

@Component(EmbeddingModel)
export class OllamaEmbeddingModel implements EmbeddingModel {

    @Autowired(OllamaOptions)
    protected readonly defaultOptions: OllamaOptions;

    @Autowired(OllamaAPI)
    protected readonly chatApi: OllamaAPI;

    public async call(request: EmbeddingRequest): Promise<EmbeddingResponse> {
        Assert.notEmpty(request.instructions, 'At least one text is required!');
        const ollamaRequest: OllamaEmbeddingsRequest = this.parseOllamaEmbeddingsRequest(request.instructions, request.options);
        const { body: ollamaResponse } = await this.chatApi.embed(ollamaRequest);

        const embeddings: Embedding[] = ollamaResponse.embeddings.map((embedding, index) => ({
            embedding: embedding,
            index,
            metadata: EmbeddingResultMetadata.EMPTY,
            output: embedding
        }));

        const embeddingResponseMetadata = <EmbeddingResponseMetadata>{
            model: ollamaResponse.model,
            usage: Usage.createEmpty(),
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

    protected parseOllamaEmbeddingsRequest(inputContent: string[], options: EmbeddingOptions): OllamaEmbeddingsRequest {
        let runtimeOptions: OllamaOptions | undefined = undefined;
        if (options) {
            runtimeOptions = Object.assign(OllamaOptions.builder().build(), options);
        }

        const ollamaOptions: OllamaOptions = runtimeOptions ?? this.defaultOptions;

        // Override the model.
        if (!ollamaOptions.model) {
            throw new IllegalArgumentError('Model is not set!');
        }
        const model = ollamaOptions.model;

        return new OllamaEmbeddingsRequest(
            model,
            inputContent,
            ollamaOptions.keepAlive,
            OllamaOptions.filterNonSupportedFields(ollamaOptions),
            ollamaOptions.truncate
        );
    }

}
