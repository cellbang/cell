import { Bytes } from '@celljs/core';

/**
 * Server-sent event.
 */
export interface ServerSentEvent {
    event?: string;
    data: string;
    raw: string[];
};

/**
 * Decoder for server-sent events.
 */
export interface EventDecoder {
    decode(line: string): ServerSentEvent | undefined;
}

/**
 * Decoder for line-based protocols.
 */
export interface LineDecoder {
    decode(chunk: Bytes): string[];
    flush(): string[];
}
