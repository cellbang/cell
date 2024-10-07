import { MimeType } from './mime-type';
import { InvalidMimeTypeError } from '../error';

export abstract class MimeTypeUtils {
    private static readonly BOUNDARY_CHARS: string[] =
        ['-', '_', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
        'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A',
        'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
        'V', 'W', 'X', 'Y', 'Z'];

    static readonly ALL: MimeType = new MimeType('*', '*');
    static readonly ALL_VALUE: string = '*/*';
    static readonly APPLICATION_GRAPHQL: MimeType = new MimeType('application', 'graphql+json');
    static readonly APPLICATION_GRAPHQL_VALUE: string = 'application/graphql+json';
    static readonly APPLICATION_JSON: MimeType = new MimeType('application', 'json');
    static readonly APPLICATION_JSON_VALUE: string = 'application/json';
    static readonly APPLICATION_OCTET_STREAM: MimeType = new MimeType('application', 'octet-stream');
    static readonly APPLICATION_OCTET_STREAM_VALUE: string = 'application/octet-stream';
    static readonly APPLICATION_XML: MimeType = new MimeType('application', 'xml');
    static readonly APPLICATION_XML_VALUE: string = 'application/xml';
    static readonly IMAGE_GIF: MimeType = new MimeType('image', 'gif');
    static readonly IMAGE_GIF_VALUE: string = 'image/gif';
    static readonly IMAGE_JPEG: MimeType = new MimeType('image', 'jpeg');
    static readonly IMAGE_JPEG_VALUE: string = 'image/jpeg';
    static readonly IMAGE_PNG: MimeType = new MimeType('image', 'png');
    static readonly IMAGE_PNG_VALUE: string = 'image/png';
    static readonly TEXT_HTML: MimeType = new MimeType('text', 'html');
    static readonly TEXT_HTML_VALUE: string = 'text/html';
    static readonly TEXT_PLAIN: MimeType = new MimeType('text', 'plain');
    static readonly TEXT_PLAIN_VALUE: string = 'text/plain';
    static readonly TEXT_XML: MimeType = new MimeType('text', 'xml');
    static readonly TEXT_XML_VALUE: string = 'text/xml';

    private static cachedMimeTypes: Map<string, MimeType> = new Map();

    static parseMimeType(mimeType: string): MimeType {
        if (!mimeType) {
            throw new InvalidMimeTypeError(mimeType, '"mimeType" must not be empty');
        }
        if (mimeType.startsWith('multipart')) {
            return this.parseMimeTypeInternal(mimeType);
        }
        if (!this.cachedMimeTypes.has(mimeType)) {
            this.cachedMimeTypes.set(mimeType, this.parseMimeTypeInternal(mimeType));
        }
        return this.cachedMimeTypes.get(mimeType)!;
    }

    private static parseMimeTypeInternal(mimeType: string): MimeType {
        let index = mimeType.indexOf(';');
        let fullType = (index >= 0 ? mimeType.substring(0, index) : mimeType).trim();
        if (fullType.length === 0) {
            throw new InvalidMimeTypeError(mimeType, '"mimeType" must not be empty');
        }

        if (fullType === '*') {
            fullType = '*/*';
        }
        const subIndex = fullType.indexOf('/');
        if (subIndex === -1) {
            throw new InvalidMimeTypeError(mimeType, 'does not contain "/"');
        }
        if (subIndex === fullType.length - 1) {
            throw new InvalidMimeTypeError(mimeType, 'does not contain subtype after "/"');
        }
        const type = fullType.substring(0, subIndex);
        const subtype = fullType.substring(subIndex + 1);
        if (type === '*' && subtype !== '*') {
            throw new InvalidMimeTypeError(mimeType, 'wildcard type is legal only in "*/*" (all mime types)');
        }

        let parameters: Map<string, string> | undefined = undefined;
        do {
            let nextIndex = index + 1;
            let quoted = false;
            while (nextIndex < mimeType.length) {
                const ch = mimeType.charAt(nextIndex);
                if (ch === ';') {
                    if (!quoted) {
                        break;
                    }
                } else if (ch === '"') {
                    quoted = !quoted;
                }
                nextIndex++;
            }
            const parameter = mimeType.substring(index + 1, nextIndex).trim();
            if (parameter.length > 0) {
                if (parameters === undefined) {
                    parameters = new Map();
                }
                const eqIndex = parameter.indexOf('=');
                if (eqIndex >= 0) {
                    const attribute = parameter.substring(0, eqIndex).trim();
                    const value = parameter.substring(eqIndex + 1).trim();
                    parameters.set(attribute, value);
                }
            }
            index = nextIndex;
        } while (index < mimeType.length);

        try {
            return new MimeType(type, subtype, parameters);
        } catch (ex) {
            throw new InvalidMimeTypeError(mimeType, ex.message);
        }
    }

    static parseMimeTypes(mimeTypes: string): MimeType[] {
        if (!mimeTypes) {
            return [];
        }
        return this.tokenize(mimeTypes).filter(mimeType => !!mimeType).map(this.parseMimeType);
    }

    static tokenize(mimeTypes: string): string[] {
        if (!mimeTypes) {
            return [];
        }
        const tokens: string[] = [];
        let inQuotes = false;
        let startIndex = 0;
        let i = 0;
        while (i < mimeTypes.length) {
            switch (mimeTypes.charAt(i)) {
                case '"':
                    inQuotes = !inQuotes;
                    break;
                case ',':
                    if (!inQuotes) {
                        tokens.push(mimeTypes.substring(startIndex, i));
                        startIndex = i + 1;
                    }
                    break;
                case '\\':
                    i++;
                    break;
            }
            i++;
        }
        tokens.push(mimeTypes.substring(startIndex));
        return tokens;
    }

    static toString(mimeTypes: MimeType[]): string {
        return mimeTypes.map(mimeType => mimeType.toString()).join(', ');
    }

    static sortBySpecificity<T extends MimeType>(mimeTypes: T[]): void {
        if (mimeTypes.length > 50) {
            throw new InvalidMimeTypeError(mimeTypes.toString(), 'Too many elements');
        }
        this.bubbleSort(mimeTypes, (a, b) => a.isLessSpecific(b));
    }

    private static bubbleSort<T>(list: T[], swap: (a: T, b: T) => boolean): void {
        const len = list.length;
        for (let i = 0; i < len; i++) {
            for (let j = 1; j < len - i; j++) {
                const prev = list[j - 1];
                const cur = list[j];
                if (swap(prev, cur)) {
                    list[j] = prev;
                    list[j - 1] = cur;
                }
            }
        }
    }

    static generateMultipartBoundary(): Uint8Array {
        const boundary = new Uint8Array(Math.floor(Math.random() * 11) + 30);
        for (let i = 0; i < boundary.length; i++) {
            boundary[i] = this.BOUNDARY_CHARS[Math.floor(Math.random() * this.BOUNDARY_CHARS.length)].charCodeAt(0);
        }
        return boundary;
    }
    static generateMultipartBoundaryString(): string {
        return new TextDecoder('ascii').decode(this.generateMultipartBoundary());
    }
}
