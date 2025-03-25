import { expect } from 'chai';
import '../index';
import { OpenAIChatModel } from './openai-chat-model';
import { AssistantMessage, ChatOptions, FunctionCallbackRegister, PromptTemplate } from '@celljs/ai-core';
import { createContainer } from '../test/test-container';
import { OpenAIAPI } from '../api/api-protocol';
import { MockOpenAIAPI } from '../test/mock-openai-api';

const container = createContainer();

describe('OpenAIChatModel', () => {
    let openAIChatModel: OpenAIChatModel;
    let promptTemplate: PromptTemplate;

    before(() => {
        container.rebind(OpenAIAPI).to(MockOpenAIAPI).inSingletonScope();
        openAIChatModel = container.get(OpenAIChatModel);
        promptTemplate = container.get(PromptTemplate);
        const functionCallbackRegister = container.get<FunctionCallbackRegister>(FunctionCallbackRegister);
        functionCallbackRegister.register({
            name: 'getWeather',
            description: '',
            inputTypeSchema: '{}',
            call: async () => ''
        });
    });

    describe('call', () => {
        it('should return a ChatResponse for a given prompt', async () => {
            const prompt = await promptTemplate.create('Hello', { chatOptions: { model: 'gpt-4' } });
            const response = await openAIChatModel.call(prompt);
            expect(response).to.have.property('results');
            expect(response.results.length).to.be.greaterThan(0);
            expect(response.results[0].output).to.be.instanceOf(AssistantMessage);
        });

        it('should handle tool calls correctly', async () => {
            const prompt = await promptTemplate.create('What is the weather today?', {
                chatOptions: {
                    model: 'gpt-4',
                    isProxyToolCalls: true,
                    functions: new Set(['getWeather'])
                } as ChatOptions
            });
            const response = await openAIChatModel.call(prompt);
            expect(response).to.have.property('results');
            expect(response.results.length).to.be.greaterThan(0);
            expect(response.metadata).to.have.property('model');
            expect(response.metadata).to.have.property('usage');
        });
    });

    describe('stream', () => {
        it('should return an Observable of ChatResponse for a given prompt', done => {
            (async () => {
                const prompt = await promptTemplate.create('Hello', { chatOptions: { model: 'gpt-4' } });
                const response$ = await openAIChatModel.stream(prompt);
                response$.subscribe({
                    next: response => {
                        expect(response).to.have.property('results');
                        expect(response.results.length).to.be.greaterThan(0);
                        expect(response.results[0].output).to.be.instanceOf(AssistantMessage);
                    },
                    complete: () => done()
                });
            })();
        });

        it('should throw an error when trying to stream with audio output', async () => {
            const prompt = await promptTemplate.create('Hello', {
                chatOptions: {
                    model: 'gpt-4',
                    outputModalities: ['audio']
                } as ChatOptions
            });
            try {
                await openAIChatModel.stream(prompt);
                expect.fail('Should have thrown an error');
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(e.message).to.include('Audio output is not supported');
            }
        });

        it('should handle tool calls in streaming mode', done => {
            (async () => {
                const prompt = await promptTemplate.create('What is the weather today?', {
                    chatOptions: {
                        model: 'gpt-4',
                        isProxyToolCalls: true,
                        functions: new Set(['getWeather'])
                    } as ChatOptions
                });
                const response$ = await openAIChatModel.stream(prompt);
                response$.subscribe({
                    next: response => {
                        expect(response).to.have.property('results');
                        expect(response.metadata).to.have.property('model');
                    },
                    complete: () => done()
                });
            })();
        });
    });
});
