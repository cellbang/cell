/**
 * Provides a set of interfaces and classes for a generic API designed to interact with
 * various AI models. This package includes interfaces for handling AI model calls,
 * requests, responses, results, and associated metadata. It is designed to offer a
 * flexible and adaptable framework for interacting with different types of AI models,
 * abstracting the complexities involved in model invocation and result processing. The
 * use of generics enhances the API's capability to work with a wide range of models,
 * ensuring a broad applicability across diverse AI scenarios.
 */

import { Media } from '../chat';
import { Observable } from 'rxjs';

export const Model = Symbol('Model');
export const StreamingModel = Symbol('StreamingModel');

/**
 * Interface representing the customizable options for AI model interactions. This marker
 * interface allows for the specification of various settings and parameters that can
 * influence the behavior and output of AI models. It is designed to provide flexibility
 * and adaptability in different AI scenarios, ensuring that the AI models can be
 * fine-tuned according to specific requirements.
 */
export interface ModelOptions {
    signal?: AbortSignal;
}

/**
 * Interface representing metadata associated with the results of an AI model. This
 * interface focuses on providing additional context and insights into the results
 * generated by AI models. It could include information like computation time, model
 * version, or other relevant details that enhance understanding and management of AI
 * model outputs in various applications.
 */
export interface ResultMetadata {}

/**
 * Interface representing metadata associated with an AI model's response. This interface
 * is designed to provide additional information about the generative response from an AI
 * model, including processing details and model-specific data. It serves as a value
 * object within the core domain, enhancing the understanding and management of AI model
 * responses in various applications.
 */
export interface ResponseMetadata {
    readonly extra: Record<string, any>;
}

/**
 * This interface provides methods to access the main output of the AI model and the
 * metadata associated with this result. It is designed to offer a standardized and
 * comprehensive way to handle and interpret the outputs generated by AI models, catering
 * to diverse AI applications and use cases.
 *
 * @param <T> the type of the output generated by the AI model
 */
export interface ModelResult<T> {

    /**
     * Retrieves the output generated by the AI model.
     * The output generated by the AI model
     */
    readonly output: T;

    /**
     * Retrieves the metadata associated with the result of an AI model.
     * The metadata associated with the result
     */
    readonly metadata: ResultMetadata;

}

/**
 * Interface representing a request to an AI model. This interface encapsulates the
 * necessary information required to interact with an AI model, including instructions or
 * inputs (of generic type T) and additional model options. It provides a standardized way
 * to send requests to AI models, ensuring that all necessary details are included and can
 * be easily managed.
 *
 * @param <T> the type of instructions or input required by the AI model
 */
export interface ModelRequest<T> {

    /**
     * Retrieves the instructions or input required by the AI model.
     * The instructions or input required by the AI model
     */
    readonly instructions: T; // required input

    /**
     * Retrieves the customizable options for AI model interactions.
     * The customizable options for AI model interactions
     */
    readonly options: ModelOptions;

}

/**
 * Interface representing the response received from an AI model. This interface provides
 * methods to access the main result or a list of results generated by the AI model, along
 * with the response metadata. It serves as a standardized way to encapsulate and manage
 * the output from AI models, ensuring easy retrieval and processing of the generated
 * information.
 *
 * @param <T> the type of the result(s) provided by the AI model
 */
export interface ModelResponse<T extends ModelResult<any>> {

    /**
     * Retrieves the result of the AI model.
     * The result generated by the AI model
     */
    readonly result: T;

    /**
     * Retrieves the list of generated outputs by the AI model.
     * The list of generated outputs
     */
    readonly results: T[];

    /**
     * Retrieves the response metadata associated with the AI model's response.
     * The response metadata
     */
    readonly metadata: ResponseMetadata;

}

/**
 * The Model interface provides a generic API for invoking AI models. It is designed
 * to handle the interaction with various types of AI models by abstracting the process of
 * sending requests and receiving responses. The interface uses Java generics to
 * accommodate different types of requests and responses, enhancing flexibility and
 * adaptability across different AI model implementations.
 *
 * @param <TReq> the generic type of the request to the AI model
 * @param <TRes> the generic type of the response from the AI model
 */
export interface Model<TReq extends ModelRequest<any>, TRes extends ModelResponse<any>> {

    /**
     * Executes a method call to the AI model.
     * @param request the request object to be sent to the AI model
     * @return the response from the AI model
     */
    call(request: TReq): Promise<TRes>;

}

/**
 * Data structure that contains content and metadata.
 */
export interface Content {

    /**
     * The content of the message.
     */
    content: string; // TODO consider getText

    /**
     * The media associated with the content.
     */
    media: Media[];

    /**
     * The metadata associated with the content.
     */
     metadata: Record<string, any>;

}

/**
 * The StreamingModel interface provides a generic API for invoking an AI models
 * with streaming response. It abstracts the process of sending requests and receiving a
 * streaming responses. The interface uses Java generics to accommodate different types of
 * requests and responses, enhancing flexibility and adaptability across different AI
 * model implementations.
 *
 * @param <TReq> the generic type of the request to the AI model
 * @param <TResChunk> the generic type of a single item in the streaming response from the
 * AI model
 */
export interface StreamingModel<TReq extends ModelRequest<any>, TResChunk extends ModelResponse<any>> {

    /**
     * Executes a method call to the AI model.
     * @param request the request object to be sent to the AI model
     * @return the streaming response from the AI model
     */
    stream(request: TReq): Promise<Observable<TResChunk>>;

}
