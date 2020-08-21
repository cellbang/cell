import { AxiosInstance } from 'axios';

export const RestOperations = Symbol('RestOperations');
export const RestOperationsFactory = Symbol('RestOperationsFactory');

export interface RestOperations extends AxiosInstance {

}

export interface RestOperationsFactory {
    create(): RestOperations;
}
