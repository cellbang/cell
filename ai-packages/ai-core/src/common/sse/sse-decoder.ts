import { EventDecoder, StreamEvent } from './sse-protocol';

/**
 * Server-sent event.
 */
export class SSEDecoder implements EventDecoder {
    private event?: string;
    private data: string[];
    private chunks: string[];

    constructor() {
        this.event = undefined;
        this.data = [];
        this.chunks = [];
    }

    protected buildServerSentEvent(): StreamEvent<string> {
        const sse: StreamEvent<string> = {
            event: this.event,
            data: this.data.join('\n'),
            raw: this.chunks,
        };

        this.event = undefined;
        this.data = [];
        this.chunks = [];

        return sse;
    }

    decode(line: string): StreamEvent<string> | undefined {
        if (line.endsWith('\r')) {
            line = line.substring(0, line.length - 1);
        }

        if (!line) {
            if (!this.event && this.data.length === 0) {
                return;
            }

            return this.buildServerSentEvent();
        }

        this.chunks.push(line);

        if (line.startsWith(':')) {
            return;
        }

        if (line.startsWith('{') && line.endsWith('}')) {
            this.data.push(line);
            return this.buildServerSentEvent();
        }

        const [fieldName, , value] = this.partition(line, ':');

        const trimmedValue = value.startsWith(' ') ? value.substring(1) : value;

        if (fieldName === 'event') {
            this.event = trimmedValue;
        } else if (fieldName === 'data') {
            this.data.push(trimmedValue);
        }

        return;
    }

    /**
     * Partitions a string into three parts based on a delimiter.
     * @param str The string to partition.
     * @param delimiter The delimiter to partition the string by.
     * @returns A tuple containing the three parts of the partitioned string.
     * The first part is the string before the delimiter, the second part is the delimiter itself,
     * and the third part is the string after the delimiter.
     * If the delimiter is not found in the string, the first part is the entire string, the second part is an empty string, and the third part is an empty string.
     * @example
     * partition('hello,world', ',') // ['hello', ',', 'world']
     * partition('hello,world', '.') // ['hello,world', '', '']
     * partition('hello,world', 'l') // ['he', 'l', 'lo,world']
     */
    protected partition(str: string, delimiter: string): [string, string, string] {
        const index = str.indexOf(delimiter);
        if (index !== -1) {
            return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
        }
        return [str, '', ''];
    }
}
