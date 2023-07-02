import { PathResolver } from './resolver-protocol';
import { Value, Component, UrlUtil } from '@malagu/core';

@Component(PathResolver)
export class PathResolverImpl implements PathResolver {

    @Value('malagu.vue.path')
    protected readonly path: string;

    resolve(...parts: string[]): string {
        return UrlUtil.join(this.path, ...parts.filter(v => !!v));
    }
}
