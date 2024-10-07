export class HttpHeaders {
    /**
     * The HTTP `Accept` header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.3.2">Section 5.3.2 of RFC 7231</a>
     */
    public static ACCEPT = 'Accept';
    /**
     * The HTTP `Accept-Charset`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.3.3">Section 5.3.3 of RFC 7231</a>
     */
    public static ACCEPT_CHARSET = 'Accept-Charset';
    /**
     * The HTTP `Accept-Encoding` header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.3.4">Section 5.3.4 of RFC 7231</a>
     */
    public static ACCEPT_ENCODING = 'Accept-Encoding';
    /**
     * The HTTP `Accept-Language` header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.3.5">Section 5.3.5 of RFC 7231</a>
     */
    public static ACCEPT_LANGUAGE = 'Accept-Language';
    /**
     * The HTTP `Accept-Ranges` header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7233#section-2.3">Section 5.3.5 of RFC 7233</a>
     */
    public static ACCEPT_RANGES = 'Accept-Ranges';
    /**
     * The CORS `Access-Control-Allow-Credentials` response header field name.
     * @see <a href="http://www.w3.org/TR/cors/">CORS W3C recommendation</a>
     */
    public static ACCESS_CONTROL_ALLOW_CREDENTIALS = 'Access-Control-Allow-Credentials';
    /**
     * The CORS `Access-Control-Allow-Headers` response header field name.
     * @see <a href="http://www.w3.org/TR/cors/">CORS W3C recommendation</a>
     */
    public static ACCESS_CONTROL_ALLOW_HEADERS = 'Access-Control-Allow-Headers';
    /**
     * The CORS `Access-Control-Allow-Methods` response header field name.
     * @see <a href="http://www.w3.org/TR/cors/">CORS W3C recommendation</a>
     */
    public static ACCESS_CONTROL_ALLOW_METHODS = 'Access-Control-Allow-Methods';
    /**
     * The CORS `Access-Control-Allow-Origin` response header field name.
     * @see <a href="http://www.w3.org/TR/cors/">CORS W3C recommendation</a>
     */
    public static ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin';
    /**
     * The CORS `Access-Control-Expose-Headers` response header field name.
     * @see <a href="http://www.w3.org/TR/cors/">CORS W3C recommendation</a>
     */
    public static ACCESS_CONTROL_EXPOSE_HEADERS = 'Access-Control-Expose-Headers';
    /**
     * The CORS `Access-Control-Max-Age` response header field name.
     * @see <a href="http://www.w3.org/TR/cors/">CORS W3C recommendation</a>
     */
    public static ACCESS_CONTROL_MAX_AGE = 'Access-Control-Max-Age';
    /**
     * The CORS `Access-Control-Request-Headers` request header field name.
     * @see <a href="http://www.w3.org/TR/cors/">CORS W3C recommendation</a>
     */
    public static ACCESS_CONTROL_REQUEST_HEADERS = 'Access-Control-Request-Headers';
    /**
     * The CORS `Access-Control-Request-Method` request header field name.
     * @see <a href="http://www.w3.org/TR/cors/">CORS W3C recommendation</a>
     */
    public static ACCESS_CONTROL_REQUEST_METHOD = 'Access-Control-Request-Method';
    /**
     * The HTTP `Age` header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7234#section-5.1">Section 5.1 of RFC 7234</a>
     */
    public static AGE = 'Age';
    /**
     * The HTTP `Allow` header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-7.4.1">Section 7.4.1 of RFC 7231</a>
     */
    public static ALLOW = 'Allow';
    /**
     * The HTTP `Authorization` header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7235#section-4.2">Section 4.2 of RFC 7235</a>
     */
    public static AUTHORIZATION = 'Authorization';
    /**
     * The HTTP `Cache-Control` header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7234#section-5.2">Section 5.2 of RFC 7234</a>
     */
    public static CACHE_CONTROL = 'Cache-Control';
    /**
     * The HTTP `Connection` header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7230#section-6.1">Section 6.1 of RFC 7230</a>
     */
    public static CONNECTION = 'Connection';
    /**
     * The HTTP `Content-Encoding` header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-3.1.2.2">Section 3.1.2.2 of RFC 7231</a>
     */
    public static CONTENT_ENCODING = 'Content-Encoding';
    /**
     * The HTTP `Content-Disposition` header field name.
     * @see <a href="https://tools.ietf.org/html/rfc6266">RFC 6266</a>
     */
    public static CONTENT_DISPOSITION = 'Content-Disposition';
    /**
     * The HTTP `Content-Language` header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-3.1.3.2">Section 3.1.3.2 of RFC 7231</a>
     */
    public static CONTENT_LANGUAGE = 'Content-Language';
    /**
     * The HTTP `Content-Length`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7230#section-3.3.2">Section 3.3.2 of RFC 7230</a>
     */
    public static CONTENT_LENGTH = 'Content-Length';
    /**
     * The HTTP `Content-Location`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-3.1.4.2">Section 3.1.4.2 of RFC 7231</a>
     */
    public static CONTENT_LOCATION = 'Content-Location';
    /**
     * The HTTP `Content-Range`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7233#section-4.2">Section 4.2 of RFC 7233</a>
     */
    public static CONTENT_RANGE = 'Content-Range';
    /**
     * The HTTP `Content-Type`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-3.1.1.5">Section 3.1.1.5 of RFC 7231</a>
     */
    public static CONTENT_TYPE = 'Content-Type';
    /**
     * The HTTP `Cookie`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc2109#section-4.3.4">Section 4.3.4 of RFC 2109</a>
     */
    public static COOKIE = 'Cookie';
    /**
     * The HTTP `Date`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-7.1.1.2">Section 7.1.1.2 of RFC 7231</a>
     */
    public static DATE = 'Date';
    /**
     * The HTTP `ETag`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7232#section-2.3">Section 2.3 of RFC 7232</a>
     */
    public static ETAG = 'ETag';
    /**
     * The HTTP `Expect`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.1.1">Section 5.1.1 of RFC 7231</a>
     */
    public static EXPECT = 'Expect';
    /**
     * The HTTP `Expires`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7234#section-5.3">Section 5.3 of RFC 7234</a>
     */
    public static EXPIRES = 'Expires';
    /**
     * The HTTP `From`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.5.1">Section 5.5.1 of RFC 7231</a>
     */
    public static FROM = 'From';
    /**
     * The HTTP `Host`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7230#section-5.4">Section 5.4 of RFC 7230</a>
     */
    public static HOST = 'Host';
    /**
     * The HTTP `If-Match`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7232#section-3.1">Section 3.1 of RFC 7232</a>
     */
    public static IF_MATCH = 'If-Match';
    /**
     * The HTTP `If-Modified-Since`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7232#section-3.3">Section 3.3 of RFC 7232</a>
     */
    public static IF_MODIFIED_SINCE = 'If-Modified-Since';
    /**
     * The HTTP `If-None-Match`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7232#section-3.2">Section 3.2 of RFC 7232</a>
     */
    public static IF_NONE_MATCH = 'If-None-Match';
    /**
     * The HTTP `If-Range`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7233#section-3.2">Section 3.2 of RFC 7233</a>
     */
    public static IF_RANGE = 'If-Range';
    /**
     * The HTTP `If-Unmodified-Since`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7232#section-3.4">Section 3.4 of RFC 7232</a>
     */
    public static IF_UNMODIFIED_SINCE = 'If-Unmodified-Since';
    /**
     * The HTTP `Last-Modified`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7232#section-2.2">Section 2.2 of RFC 7232</a>
     */
    public static LAST_MODIFIED = 'Last-Modified';
    /**
     * The HTTP `Link`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc5988">RFC 5988</a>
     */
    public static LINK = 'Link';
    /**
     * The HTTP `Location`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-7.1.2">Section 7.1.2 of RFC 7231</a>
     */
    public static LOCATION = 'Location';
    /**
     * The HTTP `Max-Forwards`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.1.2">Section 5.1.2 of RFC 7231</a>
     */
    public static MAX_FORWARDS = 'Max-Forwards';
    /**
     * The HTTP `Origin`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc6454">RFC 6454</a>
     */
    public static ORIGIN = 'Origin';
    /**
     * The HTTP `Pragma`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7234#section-5.4">Section 5.4 of RFC 7234</a>
     */
    public static PRAGMA = 'Pragma';
    /**
     * The HTTP `Proxy-Authenticate`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7235#section-4.3">Section 4.3 of RFC 7235</a>
     */
    public static PROXY_AUTHENTICATE = 'Proxy-Authenticate';
    /**
     * The HTTP `Proxy-Authorization`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7235#section-4.4">Section 4.4 of RFC 7235</a>
     */
    public static PROXY_AUTHORIZATION = 'Proxy-Authorization';
    /**
     * The HTTP `Range`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7233#section-3.1">Section 3.1 of RFC 7233</a>
     */
    public static RANGE = 'Range';
    /**
     * The HTTP `Referer`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.5.2">Section 5.5.2 of RFC 7231</a>
     */
    public static REFERER = 'Referer';
    /**
     * The HTTP `Retry-After`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-7.1.3">Section 7.1.3 of RFC 7231</a>
     */
    public static RETRY_AFTER = 'Retry-After';
    /**
     * The HTTP `Server`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-7.4.2">Section 7.4.2 of RFC 7231</a>
     */
    public static SERVER = 'Server';
    /**
     * The HTTP `Set-Cookie`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc2109#section-4.2.2">Section 4.2.2 of RFC 2109</a>
     */
    public static SET_COOKIE = 'Set-Cookie';
    /**
     * The HTTP `Set-Cookie2`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc2965">RFC 2965</a>
     */
    public static SET_COOKIE2 = 'Set-Cookie2';
    /**
     * The HTTP `TE`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7230#section-4.3">Section 4.3 of RFC 7230</a>
     */
    public static TE = 'TE';
    /**
     * The HTTP `Trailer`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7230#section-4.4">Section 4.4 of RFC 7230</a>
     */
    public static TRAILER = 'Trailer';
    /**
     * The HTTP `Transfer-Encoding`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7230#section-3.3.1">Section 3.3.1 of RFC 7230</a>
     */
    public static TRANSFER_ENCODING = 'Transfer-Encoding';
    /**
     * The HTTP `Upgrade`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7230#section-6.7">Section 6.7 of RFC 7230</a>
     */
    public static UPGRADE = 'Upgrade';
    /**
     * The HTTP `User-Agent`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.5.3">Section 5.5.3 of RFC 7231</a>
     */
    public static USER_AGENT = 'User-Agent';
    /**
     * The HTTP `Vary`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7231#section-7.1.4">Section 7.1.4 of RFC 7231</a>
     */
    public static VARY = 'Vary';
    /**
     * The HTTP `Via`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7230#section-5.7.1">Section 5.7.1 of RFC 7230</a>
     */
    public static VIA = 'Via';
    /**
     * The HTTP `Warning`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7234#section-5.5">Section 5.5 of RFC 7234</a>
     */
    public static WARNING = 'Warning';
    /**
     * The HTTP `WWW-Authenticate`header field name.
     * @see <a href="https://tools.ietf.org/html/rfc7235#section-4.1">Section 4.1 of RFC 7235</a>
     */
    public static WWW_AUTHENTICATE = 'WWW-Authenticate';

    public static X_REQUESTED_WITH = 'X-Requested-With';
}
