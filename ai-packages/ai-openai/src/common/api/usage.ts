import { Usage as IUsage } from '@celljs/ai-core';
import { Expose } from 'class-transformer';

/**
 * Breakdown of tokens used in the prompt.
 */
export class PromptTokensDetails {
    /**
     * Audio input tokens present in the prompt.
     */
    @Expose({ name: 'audio_tokens' })
    audioTokens?: number;

    /**
     * Cached tokens present in the prompt.
     */
    @Expose({ name: 'cached_tokens' })
    cachedTokens?: number;

    constructor(audioTokens?: number, cachedTokens?: number) {
        this.audioTokens = audioTokens;
        this.cachedTokens = cachedTokens;
    }
}

/**
 * Breakdown of tokens used in a completion.
 */
export class CompletionTokenDetails {
    /**
     * Number of tokens generated by the model for reasoning.
     */
    @Expose({ name: 'reasoning_tokens' })
    reasoningTokens?: number;

    /**
     * Number of tokens generated by the model for accepted predictions.
     */
    @Expose({ name: 'accepted_prediction_tokens' })
    acceptedPredictionTokens?: number;

    /**
     * Number of tokens generated by the model for audio.
     */
    @Expose({ name: 'audio_tokens' })
    audioTokens?: number;

    /**
     * Number of tokens generated by the model for rejected predictions.
     */
    @Expose({ name: 'rejected_prediction_tokens' })
    rejectedPredictionTokens?: number;

    constructor(
        reasoningTokens?: number,
        acceptedPredictionTokens?: number,
        audioTokens?: number,
        rejectedPredictionTokens?: number
    ) {
        this.reasoningTokens = reasoningTokens;
        this.acceptedPredictionTokens = acceptedPredictionTokens;
        this.audioTokens = audioTokens;
        this.rejectedPredictionTokens = rejectedPredictionTokens;
    }
}

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

    constructor(model: string, embeddings: number[][]) {
        this.model = model;
        this.embeddings = embeddings;
    }
}

/**
 * Usage statistics for the completion request.
 */
export class Usage implements IUsage {
    /**
     * Number of tokens in the generated completion. Only applicable for completion requests.
     */
    @Expose({ name: 'completion_tokens' })
    completionTokens?: number;

    /**
     * Number of tokens in the prompt.
     */
    @Expose({ name: 'prompt_tokens' })
    promptTokens?: number;

    /**
     * Total number of tokens used in the request (prompt + completion).
     */
    @Expose({ name: 'total_tokens' })
    totalTokens?: number;

    /**
     * Breakdown of tokens used in the prompt.
     */
    @Expose({ name: 'prompt_tokens_details' })
    promptTokensDetails?: PromptTokensDetails;

    /**
     * Breakdown of tokens used in a completion.
     */
    @Expose({ name: 'completion_tokens_details' })
    completionTokenDetails?: CompletionTokenDetails;

    constructor(
        completionTokens?: number,
        promptTokens?: number,
        totalTokens?: number,
        promptTokensDetails?: PromptTokensDetails,
        completionTokenDetails?: CompletionTokenDetails
    ) {
        this.completionTokens = completionTokens;
        this.promptTokens = promptTokens;
        this.totalTokens = totalTokens;
        this.promptTokensDetails = promptTokensDetails;
        this.completionTokenDetails = completionTokenDetails;
    }
}
