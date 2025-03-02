/**
 * Enumeration of {@literal OpenAI} API response headers.
 */
export enum OpenAIApiResponseHeaders {
    /**
     * Total number of requests allowed within timeframe.
     */
    REQUESTS_LIMIT_HEADER = 'x-ratelimit-limit-requests',

    /**
     * Remaining number of requests available in timeframe.
     */
    REQUESTS_REMAINING_HEADER = 'x-ratelimit-remaining-requests',

    /**
     * Duration of time until the number of requests reset.
     */
    REQUESTS_RESET_HEADER = 'x-ratelimit-reset-requests',

    /**
     * Total number of tokens allowed within timeframe.
     */
    TOKENS_RESET_HEADER = 'x-ratelimit-reset-tokens',

    /**
     * Remaining number of tokens available in timeframe.
     */
    TOKENS_LIMIT_HEADER = 'x-ratelimit-limit-tokens',

    /**
     * Duration of time until the number of tokens reset.
     */
    TOKENS_REMAINING_HEADER = 'x-ratelimit-remaining-tokens'
}

/**
 * Metadata description for OpenAI API response headers.
 */
export const OpenAIApiResponseHeadersDescription: Record<OpenAIApiResponseHeaders, string> = {
    [OpenAIApiResponseHeaders.REQUESTS_LIMIT_HEADER]: 'Total number of requests allowed within timeframe.',
    [OpenAIApiResponseHeaders.REQUESTS_REMAINING_HEADER]: 'Remaining number of requests available in timeframe.',
    [OpenAIApiResponseHeaders.REQUESTS_RESET_HEADER]: 'Duration of time until the number of requests reset.',
    [OpenAIApiResponseHeaders.TOKENS_RESET_HEADER]: 'Total number of tokens allowed within timeframe.',
    [OpenAIApiResponseHeaders.TOKENS_LIMIT_HEADER]: 'Remaining number of tokens available in timeframe.',
    [OpenAIApiResponseHeaders.TOKENS_REMAINING_HEADER]: 'Duration of time until the number of tokens reset.'
};
