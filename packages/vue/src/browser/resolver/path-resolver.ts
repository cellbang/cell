import { PathResolver } from './resolver-protocol';
import { Value, Component } from '@malagu/core';
import urlJoin = require('url-join');

@Component(PathResolver)
export class PathResolverImpl implements PathResolver {

    @Value('malagu.vue.path')
    protected readonly path: string;

    resolve(...parts: string[]): string {
        return urlJoin(this.path, ...parts.filter(v => !!v));
    }
}
