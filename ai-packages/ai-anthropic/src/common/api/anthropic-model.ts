/**
 * Helper class for the Anthropic model.
 */
export enum AnthropicModel {

    /**
     * The claude-3-5-sonnet-20241022 model.
     */
    CLAUDE_3_5_SONNET = 'claude-3-5-sonnet-latest',

    /**
     * The CLAUDE_3_OPUS
     */
    CLAUDE_3_OPUS = 'claude-3-opus-latest',

    /**
     * The CLAUDE_3_SONNET
     */
    CLAUDE_3_SONNET = 'claude-3-sonnet-20240229',

    /**
     * The CLAUDE 3.5 HAIKU
     */
    CLAUDE_3_5_HAIKU = 'claude-3-5-haiku-latest',

    /**
     * The CLAUDE_3_HAIKU
     */
    CLAUDE_3_HAIKU = 'claude-3-haiku-20240307',

    // Legacy models
    /**
     * The CLAUDE_2_1
     */
    CLAUDE_2_1 = 'claude-2.1',

    /**
     * The CLAUDE_2_0
     */
    CLAUDE_2 = 'claude-2.0'

}
