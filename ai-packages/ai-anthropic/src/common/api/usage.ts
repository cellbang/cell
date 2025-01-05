import { Expose } from 'class-transformer';

/**
 * Usage statistics.
 */
export class Usage {

    /**
     * The number of input tokens which were used.
     */
    @Expose({ name: 'input_tokens' })
    inputTokens: number;

    /**
     * The number of output tokens which were used.
     */
    @Expose({ name: 'output_tokens' })
    outputTokens: number;

    constructor(inputTokens: number, outputTokens: number) {
        this.inputTokens = inputTokens;
        this.outputTokens = outputTokens;
    }
}
