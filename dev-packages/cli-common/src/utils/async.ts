export interface ITask<T> {
    (): T;
}

export async function retry<T>(task: ITask<Promise<T>>, delay: number, retries: number): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < retries; i++) {
        try {
            return await task();
        } catch (error) {
            lastError = error;
            await new Promise<void>(resolve => setTimeout(() => resolve(), delay));
        }
    }

    throw lastError;
}

