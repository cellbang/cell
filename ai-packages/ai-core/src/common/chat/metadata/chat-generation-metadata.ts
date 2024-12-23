import { ResultMetadata } from '../../model/model-protocol';

/**
 * Abstract Data Type (ADT) encapsulating information on the completion choices in the AI
 * response.
 */
export interface ChatGenerationMetadata extends ResultMetadata {

    /**
     * The reason this choice completed for the generation.
     */
    readonly contentFilterMetadata?: any;

    /**
     * The reason this choice completed for the generation.
     */
    readonly finishReason?: string;
}

export class ChatGenerationMetadata {

    static EMPTY: ChatGenerationMetadata = ChatGenerationMetadata.from();

    /**
     * Factory method used to construct a new {@link ChatGenerationMetadata} from the
     * given finish reason and content filter metadata.
     *
     * @param finishReason The reason for completion.
     * @param contentFilterMetadata The content filter metadata.
     * @returns A new instance of {@link ChatGenerationMetadata}.
     */
    static from(finishReason?: string, contentFilterMetadata?: any): ChatGenerationMetadata {
        return {
            finishReason, contentFilterMetadata
        };
    }
}

