import { ChatResponse } from '../chat';
import { Usage } from '../chat/metadata';

/**
 * An utility class to provide support methods handling {@link Usage}.
 */
export abstract class UsageUtil {

    /**
     * Accumulate usage tokens from the previous chat response to the current usage
     * tokens.
     * @param currentUsage the current usage.
     * @param previousChatResponse the previous chat response.
     * @return accumulated usage.
     */
    public static getCumulativeUsage(currentUsage: Usage, previousChatResponse?: ChatResponse): Usage {
        let usageFromPreviousChatResponse: Usage | undefined = undefined;
        if (previousChatResponse?.metadata?.usage) {
            usageFromPreviousChatResponse = previousChatResponse.metadata.usage;
        } else {
            return currentUsage;
        }
        // For a valid usage from previous chat response, accumulate it to the current
        // usage.
        if (!this.isEmpty(currentUsage)) {
            let promptTokens = currentUsage.promptTokens ?? 0;
            let generationTokens = currentUsage.generationTokens ?? 0;
            let totalTokens = currentUsage.totalTokens ?? 0;
            // Make sure to accumulate the usage from the previous chat response.
            promptTokens += usageFromPreviousChatResponse.promptTokens ?? 0;
            generationTokens += usageFromPreviousChatResponse.generationTokens ?? 0;
            totalTokens += usageFromPreviousChatResponse.totalTokens ?? 0;
            return Usage.from(promptTokens, generationTokens, totalTokens);
        }
        // When current usage is empty, return the usage from the previous chat response.
        return usageFromPreviousChatResponse;
    }

    // /**
    //  * Check if the {@link Usage} is empty. Returns true when the {@link Usage} is null.
    //  * Returns true when the {@link Usage} has zero tokens.
    //  * @param usage the usage to check against.
    //  * @return the boolean value to represent if it is empty.
    //  */
    // static isEmpty(usage: Usage | null): boolean {
    //     if (!usage) {
    //         return true;
    //     } else if (usage != null && usage.totalTokens === 0) {
    //         return true;
    //     }
    //     return false;
    // }
    static isEmpty(usage: Usage | null): boolean {
        if (!usage) {
            return true;
        }

        return false;
    }
}
