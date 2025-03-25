import { IllegalArgumentError } from '@celljs/core';
import { ResponseMetadata } from '../../model/model-protocol';

/**
 * Abstract Data Type (ADT) encapsulating metadata on the usage of an AI provider's API
 * per AI request.
 */
export interface Usage {

    /**
     * The number of tokens used in the prompt of the AI request.
     */
    readonly promptTokens?: number;

    /**
     * The number of tokens returned in the generation (aka completion)
     * of the AI's response.
     */
    readonly generationTokens?: number;

    /**
     * The total number of tokens from both the prompt of an AI request
     * and generation of the AI's response.
     */
    readonly totalTokens?: number;

}

export namespace Usage {
    export function createEmpty(): Usage {
        return { promptTokens: 0, generationTokens: 0, totalTokens: 0 };
    }

    export function from(promptTokens = 0, generationTokens = 0, totalTokens = 0): Usage {
        return { promptTokens, generationTokens, totalTokens: totalTokens ? totalTokens : promptTokens + generationTokens };
    }
}

/**
 * Abstract Data Type (ADT) encapsulating metadata from an AI provider's API rate limits
 * granted to the API key in use and the API key's current balance.
 */
export interface RateLimit {

    /**
     * The maximum number of requests that are permitted before exhausting the
     * rate limit.
     */
    readonly requestsLimit?: number;

    /**
     * The remaining number of requests that are permitted before exhausting the
     * requestsLimit rate limit.
     */
    readonly requestsRemaining?: number;

    /**
     * The duration time until the rate limit (based on requests) resets
     * to its requestsLimit initial state.
     */
    readonly requestsReset?: number;

    /**
     * The maximum number of tokens that are permitted before exhausting the rate
     * limit.
     */
    readonly tokensLimit?: number;

    /**
     * The remaining number of tokens that are permitted before exhausting the
     * tokensLimit rate limit.
     */
    readonly tokensRemaining?: number;

    /**
     * The duration time until the rate limit (based on tokens) resets to
     * its tokensLimit initial state.
     */
    readonly tokensReset?: number;

}

/**
 * Abstract Data Type (ADT) modeling filter metadata for all prompts sent during an AI
 * request.
 */
export interface PromptFilterMetadata<T = any> {

    /**
     * Index of the prompt filter metadata contained in the AI response.
     */
    readonly promptIndex: number;

    /**
     * Returns the underlying AI provider metadata for filtering applied to prompt
     * content.
     * @param <T> {@link Class Type} used to cast the filtered content metadata into
     * the AI provider-specific type.
     * @return the underlying AI provider metadata for filtering applied to prompt
     * content.
     */
    readonly contentFilterMetadata: T;

}

/**
 * Abstract Data Type (ADT) modeling metadata gathered by the AI during request
 * processing.
 */
export type PromptMetadata = PromptFilterMetadata[];

export namespace PromptMetadata {
    /**
     * Returns an Optional {@link PromptFilterMetadata} at the given index.
     * @param promptIndex index of the {@link PromptFilterMetadata} contained in this
     * {@link PromptMetadata}.
     * @return Optional {@link PromptFilterMetadata} at the given index.
     * @throws IllegalArgumentError if the prompt index is less than 0.
     */
    export function findByPromptIndex(promptMetadata: PromptMetadata, promptIndex: number): PromptFilterMetadata | undefined {

        if (promptIndex < 0) {
            throw new IllegalArgumentError(`Prompt index [${promptIndex}] must be greater than equal to 0`);
        }

        return promptMetadata.find(promptFilterMetadata => promptFilterMetadata.promptIndex === promptIndex);
    }
}

export namespace RateLimit {
    export function createEmpty(): RateLimit {
        return { requestsLimit: 0, requestsRemaining: 0, requestsReset: 0, tokensLimit: 0, tokensRemaining: 0, tokensReset: 0 };
    }
}

export interface ChatResponseMetadata extends ResponseMetadata {
    id?: string;
    model?: string;
    /**
     * AI provider specific metadata on rate limits.
     * @see RateLimit
     */
    rateLimit: RateLimit;

    /**
     * AI provider specific metadata on API usage.
     * @see Usage
     */
    usage: Usage;

    promptMetadata: PromptMetadata;

}

export class ChatResponseMetadataBuilder {

    private readonly chatResponseMetadata: ChatResponseMetadata = ChatResponseMetadata.createEmpty();

    id(id: string): ChatResponseMetadataBuilder {
        this.chatResponseMetadata.id = id;
        return this;
    }

    model(model: string): ChatResponseMetadataBuilder {
        this.chatResponseMetadata.model = model;
        return this;
    }

    rateLimit(rateLimit: RateLimit): ChatResponseMetadataBuilder {
        this.chatResponseMetadata.rateLimit = rateLimit;
        return this;
    }

    usage(usage: Usage): ChatResponseMetadataBuilder {
        this.chatResponseMetadata.usage = usage;
        return this;
    }

    promptMetadata(promptMetadata: PromptMetadata): ChatResponseMetadataBuilder {
        this.chatResponseMetadata.promptMetadata = promptMetadata;
        return this;
    }

    keyValue(key: string, value: any): ChatResponseMetadataBuilder {
        if (!key) {
            throw new IllegalArgumentError('Key must not be empty');
        }
        if (value) {
            this.chatResponseMetadata.extra[key] = value;
        }

        return this;
    }

    build(): ChatResponseMetadata {
        return this.chatResponseMetadata;
    }

}

export namespace ChatResponseMetadata {

    export function createEmpty(): ChatResponseMetadata {
        return {
            id: '',
            model: '',
            rateLimit: RateLimit.createEmpty(),
            usage: Usage.createEmpty(),
            promptMetadata: [] as PromptMetadata,
            extra: {}
        };
    }

    export function builder(): ChatResponseMetadataBuilder {
        return new ChatResponseMetadataBuilder();
    }
}
