import { expect } from 'chai';
import '../index';
import { AnthropicChatModel } from './anthropic-chat-model';
import { AssistantMessage, PromptTemplate } from '@celljs/ai-core';
import { createContainer } from '../test/test-container';
import { AnthropicModel } from '../api/anthropic-model';
import { MockAnthropicAPI } from '../test/mock-anthropic-api';
import { AnthropicAPI } from '../api/api-protocol';

const container = createContainer();

describe('AnthropicChatModel', () => {
    let anthropicChatModel: AnthropicChatModel;
    let promptTemplate: PromptTemplate;

    before(() => {
        container.rebind(AnthropicAPI).to(MockAnthropicAPI).inSingletonScope();
        anthropicChatModel = container.get(AnthropicChatModel);
        promptTemplate = container.get(PromptTemplate);
    });

    describe('call', () => {
        it('should return a ChatResponse for a given prompt', async () => {
            const prompt = await promptTemplate.create('Hello', { chatOptions: { model: AnthropicModel.CLAUDE_3_5_SONNET } });
            const response = await anthropicChatModel.call(prompt);
            expect(response).to.have.property('result');
            expect(response.result.output).to.be.instanceOf(AssistantMessage);
        });

        it('should throw an error if the model is not set', async () => {
            const prompt = await promptTemplate.create('Hello', { chatOptions: { model: '' } });
            try {
                await anthropicChatModel.call(prompt);
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(e.message).to.equal('Model is not set!');
            }
        });
    });

    describe('stream', () => {
        it('should return an Observable of ChatResponse for a given prompt', done => {
            (async () => {
                const prompt = await promptTemplate.create('Hello', { chatOptions: { model: AnthropicModel.CLAUDE_3_5_SONNET } });
                const response$ = await anthropicChatModel.stream(prompt);
                response$.subscribe({
                    next: response => {
                        expect(response).to.have.property('result');
                        expect(response.result.output).to.be.instanceOf(AssistantMessage);
                    },
                    complete: () => done()
                });
            })();
        });

        it('should throw an error if the model is not set', async () => {
            const prompt = await promptTemplate.create('Hello', { chatOptions: { model: '' } });
            try {
                await anthropicChatModel.stream(prompt);
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(e.message).to.equal('Model is not set!');
            }
        });

    });
});
