export const FaaSEventListener = Symbol('FaaSEventListener');

export interface FaaSEventListener<T> {
    onTrigger(event: T): Promise<void>
}
