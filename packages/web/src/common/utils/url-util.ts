import { ConfigUtil, ContainerUtil } from '@celljs/core';
import { ENDPOINT } from '../constants';
import { PathResolver } from '../resolver';

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

    export async function getUrl(...paths: string[]) {
        const endpoint = ConfigUtil.get<string>(ENDPOINT);
        const pathResolver = ContainerUtil.get<PathResolver>(PathResolver);
        return pathResolver.resolve(endpoint, await pathResolver.resolve(...paths));
    }

    export async function getPath(...paths: string[]) {
        const pathResolver = ContainerUtil.get<PathResolver>(PathResolver);
        return pathResolver.resolve(...paths);
    }

}
