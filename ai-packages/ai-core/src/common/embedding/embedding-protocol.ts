import { MimeType, MimeTypeUtils } from '@celljs/core';
import { Usage } from '../chat/metadata/metadata-protocol';
import { Model, ModelOptions, ModelRequest, ModelResponse, ModelResult, ResponseMetadata, ResultMetadata } from '../model/model-protocol';

export const EmbeddingModel = Symbol('EmbeddingModel');

/**
 * Represents the metadata for an embedding result.
 */
export interface EmbeddingResultMetadata extends ResultMetadata {
    /**
     * The modality type of the source data used to generate the embedding.
     */
    modalityType: ModalityType;

    /**
     * The document ID associated with the embedding.
     */
    documentId: string;

    /**
     * The MIME type of the source data used to generate the embedding.
     */
    mimeType: MimeType;

    /**
     * The document data associated with the embedding.
     */
    documentData: any;
}

/**
 * Enum representing the modality type of the source data.
 */
export enum ModalityType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    AUDIO = 'AUDIO',
    VIDEO = 'VIDEO'
}

/**
 * Utility class for modality-related operations.
 */
export class ModalityUtils {
    private static TEXT_MIME_TYPE = MimeTypeUtils.parseMimeType('text/*');
    private static IMAGE_MIME_TYPE = MimeTypeUtils.parseMimeType('image/*');
    private static VIDEO_MIME_TYPE = MimeTypeUtils.parseMimeType('video/*');
    private static AUDIO_MIME_TYPE = MimeTypeUtils.parseMimeType('audio/*');

    /**
     * Infers the {@link ModalityType} of the source data used to generate the
     * embedding using the source data {@link MimeType}.
     * @param mimeType the {@link MimeType} of the source data.
     * @return Returns the {@link ModalityType} of the source data used to generate
     * the embedding.
     */
    public static getModalityType(mimeType: MimeType): ModalityType {
        if (!mimeType) {
            return ModalityType.TEXT;
        }

        if (mimeType.isCompatibleWith(ModalityUtils.IMAGE_MIME_TYPE)) {
            return ModalityType.IMAGE;
        } else if (mimeType.isCompatibleWith(ModalityUtils.AUDIO_MIME_TYPE)) {
            return ModalityType.AUDIO;
        } else if (mimeType.isCompatibleWith(ModalityUtils.VIDEO_MIME_TYPE)) {
            return ModalityType.VIDEO;
        } else if (mimeType.isCompatibleWith(ModalityUtils.TEXT_MIME_TYPE)) {
            return ModalityType.TEXT;
        }

        throw new Error('Unsupported MimeType: ' + mimeType);
    }
}

/**
 * Metadata for the embedding response.
 */
export interface EmbeddingResponseMetadata extends ResponseMetadata {
    /**
     * The model that handled the request.
     */
    model: string;

    /**
     * The AI provider specific metadata on API usage.
     * @see Usage
     */
    usage: Usage;
}

/**
 * Represents a single embedding vector.
 */
export interface Embedding extends ModelResult<number[]> {
    /**
     * The embedding vector values.
     */
    embedding: number[];

    /**
     * The embedding index in a list of embeddings.
     */
    index: number;

    /**
     * The metadata associated with the embedding.
     */
    metadata: EmbeddingResultMetadata;
}

export interface EmbeddingOptions extends ModelOptions {

    /**
     * The name of the embedding model to use.
     */
    model?: string;

    /**
     * The dimensionality of the embedding vectors.
     */
    dimensions?: number;
}

export interface EmbeddingRequest extends ModelRequest<string[]> {
    /**
     * The list of input strings for the embedding request.
     */
    inputs: string[];

    /**
     * The options for the embedding request.
     */
    options: EmbeddingOptions;
}

/**
 * Embedding response object.
 */
export interface EmbeddingResponse extends ModelResponse<Embedding> {
    /**
     * Embedding data.
     */
    embeddings: Embedding[];

    /**
     * Embedding metadata.
     */
    metadata: EmbeddingResponseMetadata;
}

export interface EmbeddingModel extends Model<EmbeddingRequest, EmbeddingResponse> {}
