import { PathResolver } from './resolver-protocol';
import { Value, Component } from '@malagu/core';
import urlJoin = require('url-join');
import { SERVER_PATH } from '../constants';

@Component(PathResolver)
export class PathResolverImpl implements PathResolver {

    @Value(SERVER_PATH)
    protected readonly serverPath: string;

    async resolve(...parts: string[]): Promise<string> {
        return urlJoin(this.serverPath, ...parts.filter(v => !!v));
    }
}
