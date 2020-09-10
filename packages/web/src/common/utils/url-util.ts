export namespace UrlUtil {

    export function isValidRedirectUrl(url?: string) {
        return url && (url.startsWith('/') || isAbsoluteUrl(url));
    }

    /**
     * Decides if a URL is absolute based on whether it contains a valid scheme name, as
     * defined in RFC 1738.
     */
    export function isAbsoluteUrl(url?: string) {
        if (!url) {
            return false;
        }
        return /^[a-z0-9.+-]+:\/\/.*/i.test(url);
    }
}
