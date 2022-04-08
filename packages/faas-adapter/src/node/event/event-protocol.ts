export const FaaSEventListener = Symbol('FaaSEventListener');

export interface FaaSEventListener<T, R> {
    onTrigger(event: T): Promise<R>;
}
