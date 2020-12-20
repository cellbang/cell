import { HttpMethod } from '@malagu/web';

export const RequestCache = Symbol('RequestCache');
export const SAVED_REQUEST = 'MALAGU_SECURITY_SAVED_REQUEST';

export interface SavedRequest {
    redirectUrl: string;
    method: HttpMethod;
    query: { [key: string]: string };
}

export interface RequestCache {
    save(savedRequest?: SavedRequest): Promise<void>;
    get(): Promise<SavedRequest | undefined>;
    remove(): Promise<void>;

}
