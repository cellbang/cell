import { Expose, Type } from 'class-transformer';
import { Message } from './message';

/**
 * Ollama chat response object.
 *
 * @param model The model used for generating the response.
 * @param createdAt The timestamp of the response generation.
 * @param message The response {@link Message} with {@link Message.Role#ASSISTANT}.
 * @param doneReason The reason the model stopped generating text.
 * @param done Whether this is the final response. For streaming response only the
 * last message is marked as done. If true, this response may be followed by another
 * response with the following, additional fields: context, prompt_eval_count,
 * prompt_eval_duration, eval_count, eval_duration.
 * @param totalDuration Time spent generating the response.
 * @param loadDuration Time spent loading the model.
 * @param promptEvalCount Number of tokens in the prompt.
 * @param promptEvalDuration Time spent evaluating the prompt.
 * @param evalCount Number of tokens in the response.
 * @param evalDuration Time spent generating the response.
 *
 * @see [Chat Completion API](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion)
 * @see [Ollama Types](https://github.com/ollama/ollama/blob/main/api/types.go)
 */
export class ChatResponse {
    @Expose()
    model: string;

    @Expose({ name: 'created_at' })
    @Type(() => Date)
    createdAt: Date;

    @Expose()
    @Type(() => Message)
    message: Message;

    @Expose({ name: 'done_reason' })
    doneReason: string;

    @Expose()
    done: boolean;

    @Expose({ name: 'total_duration' })
    totalDuration: number;

    @Expose({ name: 'load_duration' })
    loadDuration: number;

    @Expose({ name: 'prompt_eval_count' })
    promptEvalCount?: number;

    @Expose({ name: 'prompt_eval_duration' })
    promptEvalDuration: number;

    @Expose({ name: 'eval_count' })
    evalCount?: number;

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
