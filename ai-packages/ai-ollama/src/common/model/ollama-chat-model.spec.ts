import { expect } from 'chai';
import '../index';
import { OllamaChatModel } from './ollama-chat-model';
import { AssistantMessage, PromptTemplate } from '@celljs/ai-core';
import { createContainer } from '../test/test-container';
import { OllamaModel } from '../api/ollama-model';
import { MockOllamaAPI } from '../test/mock-ollama-api';
import { OllamaAPI } from '../api/api-protocol';

const container = createContainer();

describe('OllamaChatModel', () => {
    let ollamaChatModel: OllamaChatModel;
    let promptTemplate: PromptTemplate;

    before(() => {

        container.rebind(OllamaAPI).to(MockOllamaAPI).inSingletonScope();
        ollamaChatModel = container.get(OllamaChatModel);
        promptTemplate = container.get(PromptTemplate);
    });

    describe('call', () => {
        it('should return a ChatResponse for a given prompt', async () => {
            const prompt = await promptTemplate.create('Hello', { chatOptions: { model: OllamaModel.LLAMA3_2 } });
            const response = await ollamaChatModel.call(prompt);
            expect(response).to.have.property('result');
            expect(response.result.output).to.be.instanceOf(AssistantMessage);
        });

        it('should throw an error if the model is not set', async () => {
            const prompt = await promptTemplate.create('Hello', { chatOptions: { model: '' } });
            try {
                await ollamaChatModel.call(prompt);
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(e.message).to.equal('Model is not set!');
            }
        });
    });

    describe('stream', () => {
        it('should return an Observable of ChatResponse for a given prompt', done => {
            (async () => {
                const prompt = await promptTemplate.create('Hello', { chatOptions: { model: OllamaModel.LLAMA3_2 } });
                const response$ = await ollamaChatModel.stream(prompt);
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
                await ollamaChatModel.stream(prompt);
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(e.message).to.equal('Model is not set!');
            }
        });

    });
});
