import { Expose, Type } from 'class-transformer';
import { Message } from './message';

/**
 * Ollama chat response object.
 *
 * @see [Chat Completion API](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion)
 * @see [Ollama Types](https://github.com/ollama/ollama/blob/main/api/types.go)
 */
export class ChatResponse {
    /**
     * The model used for generating the response.
     */
    @Expose()
    model: string;

    /**
     * The timestamp of the response generation.
     */
    @Expose({ name: 'created_at' })
    @Type(() => Date)
    createdAt: Date;

    /**
     * The response {@link Message} with {@link Message.Role#ASSISTANT}.
     */
    @Type(() => Message)
    @Expose()
    message: Message;

    /**
     * The reason the model stopped generating text.
     */
    @Expose({ name: 'done_reason' })
    doneReason: string;

    /**
     * Whether this is the final response. For streaming response only the last message is marked as done.
     * If true, this response may be followed by another response with the following,
     * additional fields: context, prompt_eval_count, prompt_eval_duration, eval_count, eval_duration.
     */
    @Expose()
    done: boolean;

    /**
     * Time spent generating the response.
     */
    @Expose({ name: 'total_duration' })
    totalDuration: number;

    /**
     * Time spent loading the model.
     */
    @Expose({ name: 'load_duration' })
    loadDuration: number;

    /**
     * Number of tokens in the prompt.
     */
    @Expose({ name: 'prompt_eval_count' })
    promptEvalCount?: number;

    /**
     * Time spent evaluating the prompt.
     */
    @Expose({ name: 'prompt_eval_duration' })
    promptEvalDuration: number;

    /**
     * Number of tokens in the response.
     */
    @Expose({ name: 'eval_count' })
    evalCount?: number;

    /**
     * Time spent generating the response.
     */
    @Expose({ name: 'eval_duration' })
    evalDuration: number;

    constructor(
        model: string,
        createdAt: Date,
        message: Message,
        doneReason: string,
        done: boolean,
        totalDuration: number,
        loadDuration: number,
        promptEvalCount: number,
        promptEvalDuration: number,
        evalCount: number,
        evalDuration: number
    ) {
        this.model = model;
        this.createdAt = createdAt;
        this.message = message;
        this.doneReason = doneReason;
        this.done = done;
        this.totalDuration = totalDuration;
        this.loadDuration = loadDuration;
        this.promptEvalCount = promptEvalCount;
        this.promptEvalDuration = promptEvalDuration;
        this.evalCount = evalCount;
        this.evalDuration = evalDuration;
    }
}
