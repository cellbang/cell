
import { ResponseEntity } from '@celljs/http';
import { Assert, ContainerUtil, Logger } from '@celljs/core';
import { RateLimit } from '@celljs/ai-core';
import { OpenAIApiResponseHeaders } from './openai-api-response-headers';

/**
 * Utility used to extract known HTTP response headers for the {@literal OpenAI} API.
 */
export abstract class OpenAIResponseHeaderExtractor {

    public static extractAIResponseHeaders(response: ResponseEntity<unknown>): RateLimit {
        const requestsLimit = this.getHeaderAsLong(response, OpenAIApiResponseHeaders.REQUESTS_LIMIT_HEADER);
        const requestsRemaining = this.getHeaderAsLong(response, OpenAIApiResponseHeaders.REQUESTS_REMAINING_HEADER);
        const tokensLimit = this.getHeaderAsLong(response, OpenAIApiResponseHeaders.TOKENS_LIMIT_HEADER);
        const tokensRemaining = this.getHeaderAsLong(response, OpenAIApiResponseHeaders.TOKENS_REMAINING_HEADER);

        const requestsReset = this.getHeaderAsDuration(response, OpenAIApiResponseHeaders.REQUESTS_RESET_HEADER);
        const tokensReset = this.getHeaderAsDuration(response, OpenAIApiResponseHeaders.TOKENS_RESET_HEADER);

        return {
            requestsLimit,
            requestsRemaining,
            requestsReset,
            tokensLimit,
            tokensRemaining,
            tokensReset
        };
    }

    private static getHeaderAsDuration(response: ResponseEntity<unknown>, headerName: string): number | undefined {
        const headers = response.headers;
        if (headerName in headers) {
            const values = headers[headerName];
            if (values && values.length > 0) {
                return DurationFormatter.TIME_UNIT.parse(values[0]);
            }
        }
        return undefined;
    }

    private static getHeaderAsLong(response: ResponseEntity<unknown>, headerName: string): number | undefined {
        const headers = response.headers;
        if (headerName in headers) {
            const values = headers[headerName];
            if (values && values.length > 0) {
                return this.parseLong(headerName, values[0]);
            }
        }
    }

    private static parseLong(headerName: string, headerValue: string): number | undefined {
        if (headerValue) {
            try {
                return parseInt(headerValue.trim(), 10);
            } catch (e) {
                ContainerUtil.get<Logger>(Logger).warn(`Value [${headerValue}] for HTTP header [${headerName}] is not valid: ${e.message}`);
            }
        }
    }
}

/**
 * Duration formatter for parsing time units.
 */
class DurationFormatter {
    static readonly TIME_UNIT = new DurationFormatter(/\d+[a-zA-Z]{1,2}/);

    constructor(private readonly pattern: RegExp) {}

    parse(text: string): number {
        Assert.hasText(text, `Text [${text}] to parse as a Duration must not be null or empty`);

        const matches = text.match(this.pattern);
        let total = 0;

        if (matches) {
            for (const value of matches) {
                total += Unit.toDuration(Unit.parseUnit(value), value);
            }
        }

        return total;
    }
}

/**
 * Time unit enum for duration parsing.
 */
enum Unit {
    NANOSECONDS = 'ns',
    MICROSECONDS = 'us',
    MILLISECONDS = 'ms',
    SECONDS = 's',
    MINUTES = 'm',
    HOURS = 'h',
    DAYS = 'd'
}

namespace Unit {
    const unitMap = new Map<string, { name: string, multiplier: number }>([
        [Unit.NANOSECONDS, { name: 'nanoseconds', multiplier: 1 }],
        [Unit.MICROSECONDS, { name: 'microseconds', multiplier: 1000 }],
        [Unit.MILLISECONDS, { name: 'milliseconds', multiplier: 1000 * 1000 }],
        [Unit.SECONDS, { name: 'seconds', multiplier: 1000 * 1000 * 1000 }],
        [Unit.MINUTES, { name: 'minutes', multiplier: 1000 * 1000 * 1000 * 60 }],
        [Unit.HOURS, { name: 'hours', multiplier: 1000 * 1000 * 1000 * 60 * 60 }],
        [Unit.DAYS, { name: 'days', multiplier: 1000 * 1000 * 1000 * 60 * 60 * 24 }]
    ]);

    export function parseUnit(value: string): Unit {
        const symbol = parseSymbol(value);
        const unit = [...unitMap.keys()].find(u => u === symbol);
        if (!unit) {
            throw new Error(`Value [${value}] does not contain a valid time unit`);
        }
        return unit as Unit;
    }

    function parse(value: string, predicate: (char: string) => boolean): string {
        Assert.hasText(value, `Value [${value}] must not be null or empty`);
        return Array.from(value).filter(predicate).join('');
    }

    function parseSymbol(value: string): string {
        return parse(value, char => /[a-zA-Z]/.test(char));
    }

    function parseTime(value: string): number {
        return parseInt(parse(value, char => /\d/.test(char)), 10);
    }

    export function getName(unit: Unit): string {
        return unitMap.get(unit)?.name ?? unit;
    }

    export function toDuration(unit: Unit, value: string): number {
        const multiplier = unitMap.get(unit)?.multiplier ?? 1;
        return parseTime(value) * multiplier;
    }
}
