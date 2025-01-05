import { Bytes } from '@celljs/core';

/**
 * Server-sent event.
 */
export interface StreamEvent<Data> {
    event?: string;
    data: Data;
    raw: string[];
};

/**
 * Decoder for server-sent events.
 */
export interface EventDecoder {
    decode(line: string): StreamEvent<string> | undefined;
}

/**
 * Decoder for line-based protocols.
 */
export interface LineDecoder {
    decode(chunk: Bytes): string[];
    flush(): string[];
}
