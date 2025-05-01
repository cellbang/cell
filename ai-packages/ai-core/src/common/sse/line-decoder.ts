import { Bytes, ByteUtil } from '@celljs/core';
import { LineDecoder } from './sse-protocol';

/**
 * Line decoder.
 */
export class LineDecoderImpl implements LineDecoder {
    private buffer: string[];
    private trailingCR: boolean;

    static readonly NEWLINE_CHARS = new Set(['\n', '\r', '\x0b', '\x0c', '\x1c', '\x1d', '\x1e', '\x85', '\u2028', '\u2029']);
    /* eslint-disable-next-line no-control-regex */
    static readonly NEWLINE_REGEXP = /\r\n|[\n\r\x0b\x0c\x1c\x1d\x1e\x85\u2028\u2029]/g;

    constructor() {
        this.buffer = [];
        this.trailingCR = false;
    }

    decode(chunk: Bytes): string[] {
        let text = ByteUtil.decode(chunk);

        if (this.trailingCR) {
            text = '\r' + text;
            this.trailingCR = false;
        }
        if (text.endsWith('\r')) {
            this.trailingCR = true;
            text = text.slice(0, -1);
        }

        if (!text) {
            return [];
        }

        const trailingNewline = LineDecoderImpl.NEWLINE_CHARS.has(text[text.length - 1] || '');
        let lines = text.split(LineDecoderImpl.NEWLINE_REGEXP);

        if (lines.length === 1 && !trailingNewline) {
            this.buffer.push(lines[0]!);
            return [];
        }

        if (this.buffer.length > 0) {
            lines = [this.buffer.join('') + lines[0], ...lines.slice(1)];
            this.buffer = [];
        }

        if (!trailingNewline) {
            this.buffer = [lines.pop() || ''];
        }

        return lines;
    }

    flush(): string[] {
        if (this.buffer.length === 0 && !this.trailingCR) {
            return [];
        }

        const lines = [this.buffer.join('')];
        this.buffer = [];
        this.trailingCR = false;
        return lines;
    }
}
