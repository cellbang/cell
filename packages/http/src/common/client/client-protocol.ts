import { AxiosInstance, AxiosResponseHeaders } from 'axios';

export const RestOperations = Symbol('RestOperations');
export const RestOperationsFactory = Symbol('RestOperationsFactory');

export interface RestOperations extends AxiosInstance {

}

export interface RestOperationsFactory {
    create(): RestOperations;
}

export interface ResponseEntity<T> {
    status: number;
    headers:  AxiosResponseHeaders;
    body: T;
}

export class ResponseEntityUtil {
    static ok<T>(body: T, headers?:  AxiosResponseHeaders): ResponseEntity<T> {
        return {
            status: 200,
            headers: headers || {},
            body
        };
    }

    static created<T>(body: T, headers?: AxiosResponseHeaders): ResponseEntity<T> {
        return {
            status: 201,
            headers: headers || {},
            body
        };
    }

    static noContent(): ResponseEntity<void> {
        return {
            status: 204,
            headers: {},
            body: undefined
        };
    }
}
