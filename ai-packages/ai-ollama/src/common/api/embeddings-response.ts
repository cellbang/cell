import { Expose } from 'class-transformer';

/**
 * The response object returned from the /embedding endpoint.
 * @param model The model used for generating the embeddings.
 * @param embeddings The list of embeddings generated from the model.
 * Each embedding (list of doubles) corresponds to a single input text.
 */
export class EmbeddingsResponse {
    @Expose()
    model: string;

    @Expose()
    embeddings: number[][];

    constructor(
        model: string,
        embeddings: number[][]
    ) {
        this.model = model;
        this.embeddings = embeddings;
    }
}
