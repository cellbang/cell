import { Observable, Subscriber } from 'rxjs';
import { StreamEvent, SSEDecoder, LineDecoderImpl } from '../sse';
import { Bytes } from '@celljs/core';

/**
 * SSE utility class.
 */
export abstract class SSEUtil {

    static toObservable<Data>(readableStream: ReadableStream, controller?: AbortController): Observable<StreamEvent<Data>> {
        return new Observable<StreamEvent<Data>>(subscriber => {
            (async () => {
                const decoder = new SSEDecoder();
                const lineDecoder = new LineDecoderImpl();

                try {
                    const iterable = this.readableStreamAsyncIterable<Bytes>(readableStream);
                    for await (const chunk of iterable) {
                        const lines = lineDecoder.decode(chunk);
                        for (const line of lines) {
                            const sse = decoder.decode(line);
                            this.handleSSE(sse, subscriber, controller);
                        }
                    }

                    const remainingLines = lineDecoder.flush();
                    for (const line of remainingLines) {
                        const sse = decoder.decode(line);
                        if (sse) {
                            this.handleSSE(sse, subscriber, controller);
                        }
                    }

                    subscriber.complete();
                } catch (e) {
                    if (e instanceof Error && e.name === 'AbortError') {
                        subscriber.complete();
                    } else {
                        subscriber.error(e);
                    }
                } finally {
                    controller?.abort();
                }

            })();

        });

    }

    private static handleSSE<Item>(sse: StreamEvent<string> | undefined, subscriber: Subscriber<StreamEvent<Item>>, controller?: AbortController): void {
        if (sse) {
            if (sse.data.startsWith('[DONE]')) {
                subscriber.complete();
                controller?.abort();
                return;
            }

            if (!sse.event || sse.event === 'error') {
                let data;
                try {
                    data = JSON.parse(sse.data);
                } catch (e) {
                    console.error('Could not parse message into JSON:', sse.data);
                    console.error('From chunk:', sse.raw);
                    subscriber.error(e);
                    return;
                }

                if (data && data.error) {
                    subscriber.error(data.error);
                    return;
                }

                subscriber.next({
                    event: sse.event,
                    data,
                    raw: sse.raw
                });

                if (data.done === true) {
                    subscriber.complete();
                    controller?.abort();
                }
            }
        }
    }

    private static readableStreamAsyncIterable<T>(stream: any): AsyncIterableIterator<T> {
        if (stream[Symbol.asyncIterator]) {
return stream;
}

        const reader = stream.getReader();
        return {
            async next() {
                try {
                    const result = await reader.read();
                    if (result?.done) {
reader.releaseLock();
}
                    return result;
                } catch (e) {
                    reader.releaseLock();
                    throw e;
                }
            },
            async return() {
                const cancelPromise = reader.cancel();
                reader.releaseLock();
                await cancelPromise;
                return { done: true, value: undefined };
            },
            [Symbol.asyncIterator]() {
                return this;
            },
        };
    }
}
