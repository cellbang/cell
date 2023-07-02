import { PathResolver } from './resolver-protocol';
import { Value, Component, UrlUtil as CoreUrlUtil } from '@malagu/core';
import { SERVER_PATH } from '../constants';
import { UrlUtil } from '../utils';

@Component(PathResolver)
export class PathResolverImpl implements PathResolver {

    @Value(SERVER_PATH)
    protected readonly serverPath: string;

    async resolve(...parts: string[]): Promise<string> {
        const [ first, ...rest ] = parts.filter(v => !!v);
        if (!first) {
            return this.serverPath;
        } else if (UrlUtil.isAbsoluteUrl(first)) {
            return CoreUrlUtil.join(first, ...rest);
        } else if (first.startsWith(this.serverPath)) {
            return CoreUrlUtil.join(first, ...rest);
        }
        return CoreUrlUtil.join(this.serverPath, ...[ first, ...rest ]);
    }
}
