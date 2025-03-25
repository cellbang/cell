import { OpenAIAPI } from '../api/api-protocol';
import { ChatCompletionRequest } from '../api/chat-request';
import { ChatCompletion, ChatCompletionChunk, Choice, ChunkChoice, LogProbs } from '../api/chat-response';
import { EmbeddingRequest, Embedding } from '../api/embeddings-request';
import { EmbeddingResponse } from '../api/embeddings-response';
import { of, Observable } from 'rxjs';
import { ChatCompletionFinishReason, Role, ChatCompletionMessage } from '../api/message';
import { ResponseEntity, ResponseEntityUtil } from '@celljs/http';
import { Usage } from '../api/usage';

export class MockOpenAIAPI implements OpenAIAPI {
    async chat(chatRequest: ChatCompletionRequest, additionalHttpHeader?: Record<string, string>): Promise<ResponseEntity<ChatCompletion>> {
        // 使用静态创建方法创建消息
        const message = ChatCompletionMessage.create('Hello, how can I help you?', Role.ASSISTANT);
        message.toolCalls = []; // 注意这里应该使用 toolCalls 而不是 tool_calls

        const choice = new Choice();
        choice.index = 0;
        choice.message = message;
        choice.finishReason = ChatCompletionFinishReason.STOP; // 使用 finishReason 而不是 finish_reason
        choice.logprobs = new LogProbs();

        const usage = new Usage(10, 20, 30);

        const completion = new ChatCompletion();
        completion.id = 'chatcmpl-mock-id';
        completion.object = 'chat.completion';
        completion.created = Math.floor(Date.now() / 1000);
        completion.model = 'gpt-4';
        completion.choices = [choice];
        completion.usage = usage;
        completion.systemFingerprint = 'fp_mock_123'; // 使用 systemFingerprint 而不是 system_fingerprint

        return ResponseEntityUtil.ok(completion);
    }

    async streamingChat(chatRequest: ChatCompletionRequest, additionalHttpHeader?: Record<string, string>): Promise<Observable<ResponseEntity<ChatCompletionChunk>>> {
        // 使用静态创建方法创建消息
        const delta = ChatCompletionMessage.create('Hello, how can I help you?', Role.ASSISTANT);
        delta.toolCalls = []; // 注意这里应该使用 toolCalls 而不是 tool_calls

        const choice = new ChunkChoice();
        choice.index = 0;
        choice.delta = delta;
        choice.finishReason = ChatCompletionFinishReason.STOP; // 使用 finishReason 而不是 finish_reason
        choice.logprobs = new LogProbs();

        const chunk = new ChatCompletionChunk();
        chunk.id = 'chatcmpl-mock-id';
        chunk.object = 'chat.completion.chunk';
        chunk.created = Math.floor(Date.now() / 1000);
        chunk.model = 'gpt-4';
        chunk.choices = [choice];
        chunk.systemFingerprint = 'fp_mock_123'; // 使用 systemFingerprint 而不是 system_fingerprint

        return of(ResponseEntityUtil.ok(chunk));
    }

    async embed<T>(embeddingRequest: EmbeddingRequest<T>): Promise<ResponseEntity<EmbeddingResponse>> {
        const embedding = new Embedding(0, [0.1, 0.2, 0.3, 0.4, 0.5]);
        const usage = new Usage(8, 0, 8);

        return ResponseEntityUtil.ok(new EmbeddingResponse(
            'list',
            [embedding],
            'text-embedding-ada-002',
            usage
        ));
    }
}
