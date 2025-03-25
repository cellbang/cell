import { Type } from 'class-transformer';
import { Embedding } from './embeddings-request';
import { Usage } from './usage';

/**
 * List of multiple embedding responses.
 *
 * @typeparam T Type of the entities in the data list.
 */
export class EmbeddingResponse {
    /**
     * Must have value "list".
     */
    object: string;

    /**
     * List of entities.
     */
    @Type(() => Embedding)
    data: Embedding[];

    /**
     * ID of the model to use.
     */
    model: string;

    /**
     * Usage statistics for the completion request.
     */
    @Type(() => Usage)
    usage: Usage;

    constructor(
        object: string,
        data: Embedding[],
        model: string,
        usage: Usage
    ) {
        this.object = object;
        this.data = data;
        this.model = model;
        this.usage = usage;
    }
}
