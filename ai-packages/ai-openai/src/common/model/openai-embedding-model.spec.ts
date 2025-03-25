import { expect } from 'chai';
import '../index';
import { OpenAIEmbeddingModel } from './openai-embedding-model';
import { EmbeddingOptions, EmbeddingRequest } from '@celljs/ai-core';
import { createContainer } from '../test/test-container';
import { OpenAIAPI } from '../api/api-protocol';
import { MockOpenAIAPI } from '../test/mock-openai-api';
import { OpenAIEmbeddingOptions } from './openai-embedding-options';

const container = createContainer();

describe('OpenAIEmbeddingModel', () => {
    let openAIEmbeddingModel: OpenAIEmbeddingModel;
    let defaultOptions: OpenAIEmbeddingOptions;

    before(() => {
        container.rebind(OpenAIAPI).to(MockOpenAIAPI).inSingletonScope();
        openAIEmbeddingModel = container.get(OpenAIEmbeddingModel);
        defaultOptions = container.get(OpenAIEmbeddingOptions);
    });

    describe('call', () => {
        it('should return embedding response for given text', async () => {
            const request: EmbeddingRequest = {
                instructions: ['Hello world', 'Another text sample'],
                inputs: ['Hello world', 'Another text sample'],
                options: {
                    model: 'text-embedding-ada-002'
                }
            };

            const response = await openAIEmbeddingModel.call(request);

            expect(response).to.have.property('embeddings');
            expect(response.embeddings).to.be.an('array');
            expect(response.embeddings.length).to.equal(1);
            expect(response.embeddings[0].embedding).to.be.an('array');
            expect(response.metadata).to.have.property('model');
            expect(response.metadata).to.have.property('usage');
        });

        it('should throw error when no text is provided', async () => {
            const request: EmbeddingRequest = {
                instructions: [],
                inputs: [],
                options: {
                    model: 'text-embedding-ada-002'
                }
            };

            try {
                await openAIEmbeddingModel.call(request);
                expect.fail('Should throw error for empty instructions');
            } catch (error) {
                expect(error.message).to.include('At least one text is required');
            }
        });

        it('should throw error when model is not set', async () => {
            const request: EmbeddingRequest = {
                instructions: ['Test text'],
                inputs: ['Test text'],
                options: {
                    model: ''
                }
            };

            try {
                await openAIEmbeddingModel.call(request);
                expect.fail('Should throw error for missing model');
            } catch (error) {
                expect(error.message).to.include('Model is not set');
            }
        });

        it('should use default model when not specified in request', async () => {
            // Temporarily set default model for this test
            const originalModel = defaultOptions.model;
            defaultOptions.model = 'text-embedding-ada-002';

            const request: EmbeddingRequest = {
                instructions: ['Test text'],
                inputs: ['Test text'],
                options: {}
            };

            const response = await openAIEmbeddingModel.call(request);
            expect(response.metadata.model).to.equal('text-embedding-ada-002');

            // Restore original default model
            defaultOptions.model = originalModel;
        });

        it('should pass embedding options correctly', async () => {
            const request: EmbeddingRequest = {
                instructions: ['Test text'],
                inputs: ['Test text'],
                options: {
                    model: 'text-embedding-ada-002',
                    dimensions: 512,
                    encodingFormat: 'float',
                    user: 'test-user'
                } as EmbeddingOptions
            };

            const response = await openAIEmbeddingModel.call(request);
            expect(response).to.have.property('embeddings');
            expect(response.embeddings[0]).to.have.property('embedding');
            expect(response.result).to.equal(response.embeddings[0]);
        });
    });
});
