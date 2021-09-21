const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

export const isIE = (userAgent.indexOf('Trident') >= 0);
export const isEdge = (userAgent.indexOf('Edge/') >= 0);
export const isEdgeOrIE = isIE || isEdge;

export const isOpera = (userAgent.indexOf('Opera') >= 0);
export const isFirefox = (userAgent.indexOf('Firefox') >= 0);
export const isWebKit = (userAgent.indexOf('AppleWebKit') >= 0);
export const isChrome = (userAgent.indexOf('Chrome') >= 0);
export const isSafari = (userAgent.indexOf('Chrome') === -1) && (userAgent.indexOf('Safari') >= 0);
export const isIPad = (userAgent.indexOf('iPad') >= 0);
// tslint:disable-next-line:no-any
export const isNative = typeof (window as any).process !== 'undefined';
// tslint:disable-next-line:no-any
export const isBasicWasmSupported = typeof (window as any).WebAssembly !== 'undefined';

/**
 * Parse a magnitude value (e.g. width, height, left, top) from a CSS attribute value.
 * Returns the given default value (or undefined) if the value cannot be determined,
 * e.g. because it is a relative value like `50%` or `auto`.
 */
export function parseCssMagnitude(value: string | null, defaultValue: number): number;
export function parseCssMagnitude(value: string | null, defaultValue?: number): number | undefined {
    if (value) {
        let parsed: number;
        if (value.endsWith('px')) {
            parsed = parseFloat(value.substring(0, value.length - 2));
        } else {
            parsed = parseFloat(value);
        }
        if (!isNaN(parsed)) {
            return parsed;
        }
    }
    return defaultValue;
}

/**
 * Parse the number of milliseconds from a CSS time value.
 * Returns the given default value (or undefined) if the value cannot be determined.
 */
export function parseCssTime(time: string | null, defaultValue: number): number;
export function parseCssTime(time: string | null, defaultValue?: number): number | undefined {
    if (time) {
        let parsed: number;
        if (time.endsWith('ms')) {
            parsed = parseFloat(time.substring(0, time.length - 2));
        } else if (time.endsWith('s')) {
            parsed = parseFloat(time.substring(0, time.length - 1)) * 1000;
        } else {
            parsed = parseFloat(time);
        }
        if (!isNaN(parsed)) {
            return parsed;
        }
    }
    return defaultValue;
}
