
/**
 * OpenAI Chat Completion Models:
 *
 * - [GPT-4o](https://platform.openai.com/docs/models/gpt-4o)
 * - [GPT-4o mini](https://platform.openai.com/docs/models/gpt-4o-mini)
 * - [GPT-4 and GPT-4 Turbo](https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo)
 * - [GPT-3.5 Turbo](https://platform.openai.com/docs/models/gpt-3-5-turbo)
 * - [DALL·E](https://platform.openai.com/docs/models/dall-e)
 */
export enum OpenAIModel {

    /**
     * Points to the most recent snapshot of the o1 model: o1-preview-2024-09-12
     */
    O1_PREVIEW = 'o1-preview',

    /**
     * Latest o1 model snapshot
     */
    O1_PREVIEW_2024_09_12 = 'o1-preview-2024-09-12',

    /**
     * Points to the most recent o1-mini snapshot: o1-mini-2024-09-12
     */
    O1_MINI = 'o1-mini',

    /**
     * Latest o1-mini model snapshot
     */
    O1_MINI_2024_09_12 = 'o1-mini-2024-09-12',

    /**
     * Multimodal flagship model that’s cheaper and faster than GPT-4 Turbo. Currently
     * points to gpt-4o-2024-05-13.
     */
    GPT_4_O = 'gpt-4o',

    /**
     * Preview release for audio inputs in chat completions.
     */
    GPT_4_O_AUDIO_PREVIEW = 'gpt-4o-audio-preview',

    /**
     * Affordable and intelligent small model for fast, lightweight tasks. GPT-4o mini
     * is cheaper and more capable than GPT-3.5 Turbo. Currently points to
     * gpt-4o-mini-2024-07-18.
     */
    GPT_4_O_MINI = 'gpt-4o-mini',

    /**
     * GPT-4 Turbo with Vision The latest GPT-4 Turbo model with vision capabilities.
     * Vision requests can now use JSON mode and function calling. Currently points to
     * gpt-4-turbo-2024-04-09.
     */
    GPT_4_TURBO = 'gpt-4-turbo',

    /**
     * GPT-4 Turbo with Vision model. Vision requests can now use JSON mode and
     * function calling.
     */
    GPT_4_TURBO_2024_04_09 = 'gpt-4-turbo-2024-04-09',

    /**
     * (New) GPT-4 Turbo - latest GPT-4 model intended to reduce cases of “laziness”
     * where the model doesn’t complete a task. Returns a maximum of 4,096 output
     * tokens. Context window: 128k tokens
     * Currently points to gpt-4-0125-preview
     */
    GPT_4_0125_PREVIEW = 'gpt-4-0125-preview',

    /**
     * Currently points to gpt-4-0125-preview - model featuring improved instruction
     * following, JSON mode, reproducible outputs, parallel function calling, and
     * more. Returns a maximum of 4,096 output tokens Context window: 128k tokens
     */
    GPT_4_TURBO_PREVIEW = 'gpt-4-turbo-preview',

    /**
     * Currently points to gpt-4-0613. Snapshot of gpt-4 from June 13th 2023 with
     * improved function calling support. Context window: 8k tokens
     * Returns a maximum of 4,096 output tokens Context window: 8k tokens
     */
    GPT_4 = 'gpt-4',

    /**
     * Currently points to gpt-3.5-turbo-0125. model with higher accuracy at
     * responding in requested formats and a fix for a bug which caused a text
     * encoding issue for non-English language function calls. Returns a maximum of
     * 4,096 Context window: 16k tokens
     */
    GPT_3_5_TURBO = 'gpt-3.5-turbo',

    /**
     * Currently points to gpt-3.5-turbo-0125. model with higher accuracy at
     * responding in requested formats and a fix for a bug which caused a text
     * encoding issue for non-English language function calls. Returns a maximum of
     * 4,096 Context window: 16k tokens
     */
    GPT_3_5_TURBO_0125 = 'gpt-3.5-turbo-0125',

    /**
     * GPT-3.5 Turbo model with improved instruction following, JSON mode,
     * reproducible outputs, parallel function calling, and more. Returns a maximum of
     * 4,096 output tokens. Context window: 16k tokens.
     */
    GPT_3_5_TURBO_1106 = 'gpt-3.5-turbo-1106',

    /**
     * Most capable embedding model for both English and non-English tasks. DIMENSION:
     * 3072
     */
    TEXT_EMBEDDING_3_LARGE = 'text-embedding-3-large',

    /**
     * Increased performance over 2nd generation ada embedding model. DIMENSION: 1536
     */
    TEXT_EMBEDDING_3_SMALL = 'text-embedding-3-small',

    /**
     * Most capable 2nd generation embedding model, replacing 16 first generation
     * models. DIMENSION: 1536
     */
    TEXT_EMBEDDING_ADA_002 = 'text-embedding-ada-002',

    /**
     * The latest DALL·E model released in Nov 2023.
     */
    DALL_E_3 = 'dall-e-3',

    /**
     * The previous DALL·E model released in Nov 2022. The 2nd iteration of DALL·E
     * with more realistic, accurate, and 4x greater resolution images than the
     * original model.
     */
    DALL_E_2 = 'dall-e-2'
}
