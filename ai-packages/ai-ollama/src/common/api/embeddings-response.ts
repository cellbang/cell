/**
 * The response object returned from the /embedding endpoint.
 */
export class EmbeddingsResponse {
    /**
     * The model used for generating the embeddings.
     */
    model: string;

    /**
     * The list of embeddings generated from the model.
     * Each embedding (list of doubles) corresponds to a single input text.
     */
    embeddings: number[][];

    constructor(
        model: string,
        embeddings: number[][]
    ) {
        this.model = model;
        this.embeddings = embeddings;
    }
}
